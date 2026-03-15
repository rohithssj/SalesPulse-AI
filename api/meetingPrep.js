import { getAccessToken } from './auth-helper.js';

export default async function handler(req, res) {
  const INSTANCE_URL = process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
  const ACCESS_TOKEN = await getAccessToken();
  const ACTION = 'meetingPrep';

  if (!INSTANCE_URL) {
    return res.status(500).json({ error: 'INSTANCE_URL not configured' });
  }

  try {
    const url = new URL(`${INSTANCE_URL}/services/apexrest/salesforge/${ACTION}`);
    
    let accountId = req.query.accountId || req.body?.accountId || '';

    if (!accountId) {
      try {
        const accRes = await fetch(`${INSTANCE_URL}/services/apexrest/salesforge/accounts`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        });
        const accData = await accRes.json();
        if (accData && accData.length > 0) {
          accountId = accData[0].Id;
        }
      } catch (err) {
        console.error('Failed to fetch default accountId:', err.message);
      }
    }

    if (accountId) {
      url.searchParams.append('accountId', accountId);
    }

    for (const [key, value] of Object.entries(req.query || {})) {
      if (key !== 'accountId') {
        url.searchParams.append(key, value);
      }
    }

    const options = {
      method: req.method || 'GET',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url.toString(), options);
    const text = await response.text();
    
    console.log(`[API meetingPrep] SF Response: ${response.status}`);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch(e) {
      console.warn('[API meetingPrep] Failed to parse JSON:', text);
      data = { error: 'Invalid JSON from Salesforce', raw: text };
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[API ERROR] (${ACTION}):`, {
        message: error.message,
        stack: error.stack
    });
    res.status(500).json({ 
        error: 'Backend request failed', 
        details: error.message,
        action: ACTION
    });
  }
}
