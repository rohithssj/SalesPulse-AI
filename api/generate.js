import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { context, maxTokens = 1200 } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const ACCESS_TOKEN = process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;
  const INSTANCE_URL = process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
  const SF_BASE = `${INSTANCE_URL}/services/apexrest/salesforge`;

  if (!context || !context.trim()) {
    return res.status(400).json({ error: 'Context is required' });
  }

  try {
    // 1. Path 1: Anthropic API (if key is set)
    if (ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key':         ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          body: JSON.stringify({
            model:      'claude-3-5-sonnet-20240620',
            max_tokens: maxTokens,
            messages:   [{ role: 'user', content: context }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.content?.[0]?.text || '';
          return res.json({ result: text });
        }
      } catch (err) {
        console.error('[Vercel api/generate] Anthropic error:', err.message);
      }
    }

    // 2. Path 2: Salesforce strategy endpoint
    if (ACCESS_TOKEN && INSTANCE_URL) {
      try {
        const sfResponse = await fetch(`${SF_BASE}/strategy`, {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context,
            accountId:  'CONTEXT_ONLY',
            dataSource: 'context_only',
          }),
        });
        
        if (sfResponse.ok) {
          const data = await sfResponse.json();
          return res.json(data);
        }
      } catch (err) {
        console.error('[Vercel api/generate] Salesforce path error:', err.message);
      }
    }

    // 3. Path 3: Return structured fallback
    console.log('[Vercel api/generate] All paths failed — returning structured fallback');

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
      fallbackText = `Subject: Following up — ${account}\n\nHi ${contact},\n\nI wanted to reach out following our recent discussions. Based on the ${signal} we've observed from ${account}, I believe now is a great time to connect and discuss next steps.\n\n${value ? `Given the scope of what we discussed (${value}), I want to make sure we address everything on your end before moving forward.` : 'I want to make sure we address any outstanding questions on your end.'}\n\nWould you have 15 minutes this week for a brief call?\n\nBest regards,\nYour Account Executive`;
    }

    return res.json({ result: fallbackText });

  } catch (error) {
    console.error('Final Catch (api/generate):', error.message);
    res.status(500).json({ error: error.message });
  }
}
