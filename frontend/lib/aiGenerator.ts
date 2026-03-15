// lib/aiGenerator.ts
'use client';

import { parseAIResponse } from './api';

const PROXY_BASE = process.env.NEXT_PUBLIC_PROXY_URL || process.env.REACT_APP_SF_PROXY_URL || '';
const STORAGE_KEY = 'salespulse_uploaded_data';

// ── Detect upload mode ──
const isUploadMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

// ── Validate Salesforce ID ──
const isValidSalesforceId = (id?: string): boolean => {
  if (!id) return false;
  // Standard Salesforce ID is 15 or 18 alphanumeric characters
  return /^[a-zA-Z0-9]{15,18}$/.test(id.trim());
};

export type GenerationType =
  | 'email' | 'followup' | 'proposal' | 'meetingPrep'
  | 'strategy' | 'engage' | 'reengagement' | 'pricing' | 'callprep';

export interface GenerateParams {
  type:          GenerationType;
  accountId?:    string;
  accountName?:  string;
  contactName?:  string;
  contactRole?:  string;
  dealName?:     string;
  stage?:        string;
  value?:        string | number;
  probability?:  number;
  daysLeft?:     number;
  signals?:      string[];
  industry?:     string;
  tone?:         string;
  context?:      string;
}

// ── UPLOAD MODE: call /api/generate — never touches Salesforce ──
const generateViaContext = async (
  context: string
): Promise<string> => {
  try {
    const res = await fetch(`${PROXY_BASE}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ context, maxTokens: 1200 }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[generateViaContext] ${res.status} error:`, errText);
      return ''; // caller handles empty
    }

    const data = await res.json();
    const text = parseAIResponse(data);
    console.log(`[generateViaContext] Got ${text.length} chars`);
    return text;

  } catch (err) {
    console.warn('[generateViaContext] Network error:', err);
    return '';
  }
};

// ── SALESFORCE MODE: call SF endpoints with real accountId ──
const generateViaSalesforce = async (
  params: GenerateParams
): Promise<string> => {
  const {
    type, accountId, accountName, contactName,
    contactRole, dealName, stage, value,
    probability, daysLeft, signals, industry, tone,
    context,
  } = params;

  const endpointMap: Record<GenerationType, string> = {
    email:       '/email',
    followup:    '/email',
    reengagement:'/email',
    pricing:     '/email',
    engage:      '/email',
    callprep:    '/meetingPrep',
    meetingPrep: '/meetingPrep',
    proposal:    '/proposal',
    strategy:    '/strategy',
  };

  const endpoint = endpointMap[type];

  try {
    const res = await fetch(`${PROXY_BASE}/api${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        accountId,
        accountName,
        contactName,
        contactRole,
        dealName,
        dealStage:   stage,
        dealValue:   value,
        probability,
        daysLeft,
        tone:        tone || 'Formal',
        type,
        context:     context || buildContext(params),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`SF API Error on ${endpoint}:`, res.status, errText);
      return '';
    }

    const data = await res.json();
    return parseAIResponse(data) || '';
  } catch (err) {
    console.error('SF API network error:', err);
    return '';
  }
};

// ── MAIN EXPORT ──
export const generateAIContent = async (
  params: GenerateParams
): Promise<string> => {
  const { accountId, type } = params;
  const uploadModeActive = isUploadMode();
  const hasSFId    = isValidSalesforceId(accountId);

  console.log(`[aiGenerator] type=${type} uploadMode=${uploadModeActive} hasSFId=${hasSFId}`);

  let result = '';

  if (uploadModeActive || !hasSFId) {
    // Upload mode — call /generate, never Salesforce
    const context = params.context || buildContext(params);
    console.log(`[aiGenerator] Upload mode — calling /generate`);

    result = await generateViaContext(context);

    if (!result || result.trim() === '') {
      console.warn(`[aiGenerator] /generate returned empty — using inline fallback`);
      result = buildFallback(params);
    }

  } else {
    // Salesforce mode
    console.log(`[aiGenerator] SF mode — calling API`);
    result = await generateViaSalesforce(params);

    if (!result || result.trim() === '') {
      console.warn(`[aiGenerator] SF call returned empty — using inline fallback`);
      result = buildFallback(params);
    }
  }

  // FINAL safety net — should never be empty
  if (!result || result.trim() === '') {
    console.error(`[aiGenerator] All paths produced empty result for ${type}`);
    result = buildFallback(params);
  }

  console.log(`[aiGenerator] Final result length: ${result.length}`);
  return result;
};

// ── Context builder ──
const buildContext = (params: GenerateParams): string => {
  const {
    type, accountName = 'Account', contactName = 'Contact',
    contactRole = '', dealName = '', stage = 'Qualification',
    value = '$0', probability = 65, daysLeft = 30,
    signals = [], industry = 'Technology', tone = 'Formal',
  } = params;

  const signalText = signals.length > 0
    ? signals.slice(0, 3).join(', ')
    : 'recent engagement activity';

  const dealContext = `
ACCOUNT: ${accountName} | INDUSTRY: ${industry}
CONTACT: ${contactName}${contactRole ? ` (${contactRole})` : ''}
DEAL: ${dealName || accountName} | STAGE: ${stage}
VALUE: ${value} | WIN PROBABILITY: ${probability}%
DAYS TO CLOSE: ${daysLeft} | SIGNALS: ${signalText}
TONE: ${tone}
`.trim();

  const instructions: Partial<Record<GenerationType, string>> = {
    email:
      `${dealContext}\n\nWrite a professional sales email for ${stage} stage. Personalize to ${accountName}. Start directly with the greeting. No JSON.`,
    followup:
      `${dealContext}\n\nWrite a follow-up email referencing the signals: ${signalText}. One clear CTA. Max 4 paragraphs. Start with greeting. No JSON.`,
    reengagement:
      `${dealContext}\n\nWrite a re-engagement email. Lead with something NEW and valuable. Do NOT mention silence. Max 3 paragraphs. Start with greeting. No JSON.`,
    pricing:
      `${dealContext}\n\nWrite a pricing email framing cost as ROI for ${industry}. Include 2-3 tier options. End with scheduling CTA. Start with greeting. No JSON.`,
    proposal:
      `${dealContext}\n\nWrite a complete sales proposal with sections: Executive Summary, Solution Overview, Key Benefits (3 bullets), ROI Projection, Timeline, Next Steps. Use plain text headers. No JSON.`,
    meetingPrep:
      `${dealContext}\n\nCreate a meeting prep guide with: Objective (1 sentence), Opening line, 3 Key Talking Points, 3 Discovery Questions, 2 Objections with responses, Closing statement. Plain text headers. No JSON.`,
    callprep:
      `${dealContext}\n\nCreate a call prep guide for ${contactName} (${contactRole}). Include: Call Objective, Exact Opening, 3 Talking Points for ${contactRole} level, 3 Questions, 2 Objections + responses, Closing line. Plain text. No JSON.`,
    strategy:
      `${dealContext}\n\nCreate a deal strategy with: Situation (2 sentences), Priority Actions next 48 hours (3 specific actions), Key Risks (2), Recommended Next Action (1 sentence). Plain text headers. No JSON.`,
    engage:
      `${dealContext}\n\nCreate an engagement plan with 4 sections:\n1. OUTREACH EMAIL — write complete email to ${contactName}\n2. NEXT 48 HOURS — 3 specific actions\n3. OBJECTION HANDLING — 2 objections + exact responses\n4. MEETING AGENDA — 30-min structure\nPlain text. No JSON.`,
  };

  return instructions[type] || `${dealContext}\n\nGenerate helpful sales content for ${type}. Plain text. No JSON.`;
};

// ── Fallback content (shown when both paths fail) ──
const buildFallback = (params: GenerateParams): string => {
  const {
    type, accountName = 'Account', contactName = 'Contact',
    stage = 'Qualification', value = '$0',
    probability = 65, daysLeft = 30, signals = [],
  } = params;

  const signalText = signals.slice(0, 2).join(', ') || 'recent engagement';

  const fallbacks: Partial<Record<GenerationType, string>> = {
    email:
`Subject: Following up — ${accountName}

Hi ${contactName},

I wanted to reach out following our recent discussions. Based on the ${signalText} we've observed from ${accountName}, I believe this is a great time to connect.

Would you have 15 minutes this week to discuss next steps?

Best regards,
Your Account Executive`,

    followup:
`Subject: Quick follow-up — ${accountName}

Hi ${contactName},

Following up on our recent conversation. I noticed ${signalText} and wanted to make sure we keep momentum going.

Are you available for a brief call this week? I have some ideas that could be valuable given where you are right now.

Looking forward to connecting.

Best regards,
Your Account Executive`,

    proposal:
`SALES PROPOSAL — ${accountName}

EXECUTIVE SUMMARY
We propose a tailored solution for ${accountName} valued at ${value}.

SOLUTION OVERVIEW
Based on your requirements, our platform addresses your key challenges. Given your signals (${signalText}), we recommend starting with core implementation.

KEY BENEFITS
- Streamline operations with measurable ROI
- Implementation support from day one
- Scalable architecture for your growth

ROI PROJECTION
Expected payback period: 6-9 months based on similar ${stage} stage clients.

NEXT STEPS
Schedule a 30-minute review call to finalize terms.
Target close: ${daysLeft} days`,

    meetingPrep:
`MEETING PREP — ${contactName} at ${accountName}

OBJECTIVE
Advance deal from ${stage} to next stage and confirm timeline.

OPENING
"Hi ${contactName}, thanks for your time. I wanted to make sure we're aligned on next steps and address anything on your end."

KEY TALKING POINTS
1. Reinforce value — reference ${signalText}
2. Address any blockers since last conversation
3. Confirm ${daysLeft}-day timeline is still achievable

QUESTIONS TO ASK
1. What would need to be true to move forward this month?
2. Are there any internal approvals still pending?
3. How are you feeling about the proposed solution?

CLOSING
"What's the best next step from your side to keep this moving?"`,

    callprep:
`CALL PREPARATION — ${contactName} at ${accountName}

CALL OBJECTIVE
Confirm commitment and remove final blockers for ${stage} stage deal.

OPENING LINE
"Hi ${contactName}, thanks for taking my call. I wanted to connect briefly about ${accountName} and make sure everything is on track from your side."

KEY TALKING POINTS
1. Deal value: ${value} — reinforce ROI specific to your goals
2. Address the ${stage} stage blockers directly
3. Create urgency: ${daysLeft} days to close

QUESTIONS
1. What concerns do you still have about moving forward?
2. Who else needs to be involved in the final decision?
3. What would make this a clear "yes" for you?

OBJECTION HANDLING
- "Price is too high" → "Let's talk about ROI — what's the cost of NOT solving this challenge?"
- "Need more time" → "Understood — what's the specific milestone you're waiting on?"

CLOSING
"Can we agree on a specific next step before we hang up today?"`,

    strategy:
`DEAL STRATEGY — ${accountName}

SITUATION
Deal at ${stage} stage with ${probability}% win probability. ${daysLeft} days to close. Key signals: ${signalText}.

PRIORITY ACTIONS — NEXT 48 HOURS
1. Email ${contactName} with a specific value-add tied to ${signalText}
2. Schedule ${probability > 70 ? 'closing call' : 'discovery call'} this week
3. Prepare ${stage === 'Proposal' ? 'revised proposal addressing objections' : 'tailored demo for their use case'}

KEY RISKS
- Deal going silent — follow up within 24 hours if no response
- ${probability < 60 ? 'Low probability — identify and address main blocker immediately' : 'Competitor activity — reinforce unique value'}

RECOMMENDED NEXT ACTION
${probability > 70 ? `Push for commitment — this deal is ready to close. Send a clear call-to-action today.` : `Build urgency by connecting your solution directly to ${signalText}.`}`,

    engage:
`ENGAGEMENT PLAN — ${accountName}

OUTREACH EMAIL
Subject: Moving forward — ${accountName}

Hi ${contactName},

I've been reviewing our discussions and wanted to share some specific ideas for ${accountName}. Given the ${signalText} we've seen, I think now is the right moment to take the next step.

I'd love to schedule 20 minutes to walk you through a tailored approach. Are you available this week?

Best regards,
Your Account Executive

NEXT 48 HOURS
1. Send the outreach email above within 2 hours
2. Connect with secondary stakeholder if ${contactName} doesn't respond by tomorrow
3. Prepare a one-page summary doc specific to ${accountName}'s use case

OBJECTION HANDLING
- "Not the right time" → "Understood — can we at least agree on a specific date to revisit?"
- "Budget constraints" → "Let's talk ROI — what budget would make this easy to approve?"

MEETING AGENDA (30 min)
0-5 min:   Quick wins recap and relationship building
5-20 min:  Deep dive on their top challenge — listen, don't pitch
20-28 min: Present tailored solution tied to their signals
28-30 min: Agree on ONE specific next action with a date`,
  };

  return fallbacks[type]
    || `AI content for ${accountName} — ${type}.\nContact: ${contactName} | Stage: ${stage} | Value: ${value}\n\nPlease try generating again.`;
};
