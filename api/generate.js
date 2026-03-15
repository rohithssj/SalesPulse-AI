import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { context, maxTokens = 1000 } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const ACCESS_TOKEN = process.env.SALESFORCE_TOKEN;
  const INSTANCE_URL = process.env.INSTANCE_URL;

  if (!context) {
    return res.status(400).json({ error: 'Context is required' });
  }

  try {
    // 1. Try Anthropic direct if key is present
    if (ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: context }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.content?.[0]?.text || '';
        return res.json({ result: text });
      }
    }

    // 2. Fallback: Call Salesforce strategy endpoint with 'upload_mode' flag
    if (ACCESS_TOKEN && INSTANCE_URL) {
      const sfResponse = await fetch(`${INSTANCE_URL}/services/apexrest/salesforge/strategy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          accountId: 'upload_mode',
          dataSource: 'context_only'
        }),
      });
      
      const data = await sfResponse.json();
      return res.json(data);
    }

    // 3. Absolute Fallback
    return res.status(200).json({
      result: "AI generation unavailable. Context: " + context.substring(0, 100) + "..."
    });

  } catch (error) {
    console.error('API Error (generate):', error.message);
    res.status(500).json({ error: error.message });
  }
}
