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
// Validate on startup — fail loudly if missing
if (!process.env.INSTANCE_URL && !process.env.REACT_APP_SF_ORG_URL) {
  console.error('❌ INSTANCE_URL is not set in .env — proxy will not work');
  process.exit(1);
}
if (!process.env.SALESFORCE_TOKEN && !process.env.SF_ACCESS_TOKEN) {
  console.error('❌ SALESFORCE_TOKEN is not set in .env — proxy will not work');
  process.exit(1);
}

// Salesforce Configuration
const ACCESS_TOKEN = process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;
const INSTANCE_URL = process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
const APEX_BASE_URL = `${INSTANCE_URL}/services/apexrest/salesforge`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

// ── NEW: Context-only generation endpoint (upload mode) ──
app.post('/generate', async (req, res) => {
  const { context, maxTokens = 1200 } = req.body;

  if (!context || !context.trim()) {
    return res.status(400).json({ error: 'context is required' });
  }

  console.log('[/generate] Received request, context length:', context.length);

  // ── Path 1: Anthropic API (if key is set) ──
  if (ANTHROPIC_API_KEY) {
    try {
      console.log('[/generate] Calling Anthropic API...');
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model:      'claude-3-5-sonnet-20240620',
          max_tokens: maxTokens,
          messages:   [{ role: 'user', content: context }],
        },
        {
          headers: {
            'x-api-key':         ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data?.content?.[0]?.text || '';
      console.log('[/generate] Anthropic success, length:', text.length);
      return res.json({ result: text });

    } catch (err) {
      console.error('[/generate] Anthropic error:', err.message);
      // Fall through to Salesforce path
    }
  }

  // ── Path 2: Salesforce strategy endpoint ──
  if (ACCESS_TOKEN) {
    try {
      console.log('[/generate] Trying Salesforce strategy endpoint...');
      const sfResponse = await axios.post(
        `${APEX_BASE_URL}/strategy`,
        {
          context,
          accountId:  'CONTEXT_ONLY',
          dataSource: 'context_only',
        },
        {
          headers: {
            Authorization:  `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );
      console.log('[/generate] Salesforce success');
      return res.json(sfResponse.data);

    } catch (err) {
      console.error('[/generate] Salesforce path error:', err.message);
    }
  }

  // ── Path 3: Return structured fallback ──
  // Extract key info from context to build a meaningful response
  console.log('[/generate] All paths failed — returning structured fallback');

  const accountMatch = context.match(/ACCOUNT:\s*([^\n|]+)/i);
  const contactMatch = context.match(/CONTACT:\s*([^\n|(]+)/i);
  const stageMatch   = context.match(/STAGE:\s*([^\n|]+)/i);
  const valueMatch   = context.match(/VALUE:\s*([^\n|]+)/i);
  const probMatch    = context.match(/PROBABILITY:\s*([^\n|]+)/i);
  const daysMatch    = context.match(/DAYS[^:]*:\s*([^\n|]+)/i);
  const signalMatch  = context.match(/SIGNALS:\s*([^\n]+)/i);

  const account = accountMatch?.[1]?.trim() || 'the account';
  const contact = contactMatch?.[1]?.trim().split('(')[0].trim() || 'your contact';
  const stage   = stageMatch?.[1]?.trim() || 'Qualification';
  const value   = valueMatch?.[1]?.trim() || '';
  const prob    = probMatch?.[1]?.trim() || '65%';
  const days    = daysMatch?.[1]?.trim() || '30';
  const signal  = signalMatch?.[1]?.trim() || 'recent engagement';

  const isProposal    = context.toLowerCase().includes('proposal');
  const isMeeting     = context.toLowerCase().includes('meeting') || context.toLowerCase().includes('call prep');
  const isStrategy    = context.toLowerCase().includes('strategy') || context.toLowerCase().includes('engage');
  const isReengage    = context.toLowerCase().includes('re-engagement') || context.toLowerCase().includes('reengagement');

  let fallbackText = '';

  if (isProposal) {
    fallbackText = `SALES PROPOSAL — ${account}\n\nEXECUTIVE SUMMARY\nWe propose a customized solution for ${account}${value ? ` valued at ${value}` : ''}. Our platform directly addresses your key challenges and delivers measurable ROI.\n\nSOLUTION OVERVIEW\nBased on your signals (${signal}), we recommend a phased implementation starting with core modules.\n\nKEY BENEFITS\n• Immediate operational efficiency gains\n• Scalable architecture for long-term growth  \n• Dedicated implementation and support team\n\nROI PROJECTION\nClients in similar stages typically see payback within 6-9 months.\n\nNEXT STEPS\nSchedule a 30-minute review call to finalize terms and timeline.\nTarget close: ${days} days`;

  } else if (isMeeting) {
    fallbackText = `CALL PREPARATION — ${contact} at ${account}\n\nCALL OBJECTIVE\nAdvance deal from ${stage} stage and confirm next commitments.\n\nOPENING LINE\n"Hi ${contact}, thanks for your time today. I wanted to make sure we're aligned on next steps and address anything on your end before we move forward."\n\nKEY TALKING POINTS\n1. Reinforce value — reference ${signal} as proof of interest\n2. Address any blockers that came up since last conversation\n3. Confirm timeline — ${days} days to target close date\n\nQUESTIONS TO ASK\n1. What would need to be true for you to feel confident moving forward?\n2. Are there any internal approvals still pending on your side?\n3. Who else needs to be part of the final decision?\n\nOBJECTION HANDLING\n• "Need more time" → "Understood — what specific milestone are you waiting on?"\n• "Price concern" → "Let's talk ROI — what's the cost of this problem going unsolved?"\n\nCLOSING\n"Can we agree on one specific next step with a date before we wrap up today?"`;

  } else if (isStrategy) {
    fallbackText = `ENGAGEMENT STRATEGY — ${account}\n\nSITUATION\nDeal at ${stage} stage with ${prob} win probability. ${days} days to close. Signals detected: ${signal}.\n\nPRIORITY ACTIONS — NEXT 48 HOURS\n1. Send personalized email to ${contact} referencing ${signal} specifically\n2. Schedule ${parseFloat(prob) > 70 ? 'closing call' : 'discovery call'} within 48 hours\n3. Prepare one-page value summary tailored to ${account}\n\nKEY RISKS\n• Deal stalling without timely follow-up — reach out within 24 hours\n• ${parseFloat(prob) < 60 ? 'Below 60% probability — identify and address main blocker immediately' : 'Maintain momentum — do not let deal go cold'}\n\nRECOMMENDED NEXT ACTION\n${parseFloat(prob) > 70 ? `Push for commitment — this deal is close to closing. Send a direct call-to-action today.` : `Build urgency by connecting your solution directly to the signals: ${signal}.`}`;

  } else if (isReengage) {
    fallbackText = `Subject: Something valuable for ${account}\n\nHi ${contact},\n\nI've been thinking about ${account}'s goals and wanted to share something relevant. Given the developments in your space around ${signal}, I believe there's a timely opportunity worth exploring together.\n\nOur recent work with similar companies has produced some results I think you'd find valuable — happy to share a quick summary.\n\nWould a 10-minute call work this week? Just a yes or no is helpful.\n\nBest regards,\nYour Account Executive`;

  } else {
    // Default follow-up email
    fallbackText = `Subject: Following up — ${account}\n\nHi ${contact},\n\nI wanted to reach out following our recent discussions. Based on the ${signal} we've observed from ${account}, I believe now is a great time to connect and discuss next steps.\n\n${value ? `Given the scope of what we discussed (${value}), I want to make sure we address everything on your end before moving forward.` : 'I want to make sure we address any outstanding questions on your end.'}\n\nWould you have 15 minutes this week for a brief call?\n\nBest regards,\nYour Account Executive`;
  }

  return res.json({ result: fallbackText });
});

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
