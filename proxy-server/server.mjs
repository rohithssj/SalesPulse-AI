import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { maskOrgUrl } from './utils/mask-credentials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Validate on startup — fail loudly if missing
if (!process.env.REACT_APP_SF_ORG_URL) {
  console.error('❌ REACT_APP_SF_ORG_URL is not set in .env — proxy will not work');
  process.exit(1);
}
if (!process.env.SF_ACCESS_TOKEN) {
  console.error('❌ SF_ACCESS_TOKEN is not set in .env — proxy will not work');
  process.exit(1);
}

// Salesforce Configuration
const ACCESS_TOKEN = process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;
const INSTANCE_URL = process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
const APEX_BASE_URL = `${INSTANCE_URL}/services/apexrest/salesforge`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Helper to get first account ID if none provided
let defaultAccountId = '';

async function ensureDefaultAccountId() {
    if (defaultAccountId) return defaultAccountId;
    try {
        const response = await axios.get(`${APEX_BASE_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });
        if (response.data && response.data.length > 0) {
            defaultAccountId = response.data[0].Id;
            console.log('Using default account ID:', defaultAccountId);
        }
    } catch (e) {
        console.error('Error fetching accounts for default ID:', e.message);
    }
    return defaultAccountId;
}

app.all('/api/:action', async (req, res) => {
    const action = req.params.action;
    let accountId = '';
    try {
        accountId = (req.query && req.query.accountId) || (req.body && req.body.accountId) || '';
    } catch (e) {
        console.log('Error parsing accountId from request');
    }

    if (!accountId && action !== 'accounts') {
        accountId = await ensureDefaultAccountId();
    }

    const targetUrl = new URL(`${APEX_BASE_URL}/${action}`);
    if (accountId) {
        targetUrl.searchParams.append('accountId', accountId);
    }
    
    // Forward other query params except accountId
    Object.keys(req.query).forEach(key => {
        if (key !== 'accountId') {
            targetUrl.searchParams.append(key, req.query[key]);
        }
    });

    console.log(`[PROXY] ${req.method} ${action} -> AccountID: ${accountId || 'None'}`);

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl.toString(),
            data: req.body,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Proxy running on port ${PORT}`);
    const masked = maskOrgUrl(process.env.REACT_APP_SF_ORG_URL);
    console.log(`🔗 Connected to: ${masked}`);
    ensureDefaultAccountId();
});
