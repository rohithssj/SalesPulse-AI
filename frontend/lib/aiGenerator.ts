// lib/aiGenerator.ts
// Single function that handles AI generation for BOTH Salesforce and Upload mode
// Upload mode → sends only context text, no accountId
// Salesforce mode → sends real accountId

import { apiPost, isValidSalesforceId } from './api';
import { parseAIResponse } from './api';

export type GenerationType =
  | 'email'
  | 'followup'
  | 'proposal'
  | 'meetingPrep'
  | 'strategy'
  | 'engage'
  | 'reengagement'
  | 'pricing'
  | 'callprep';

interface GenerateParams {
  type: GenerationType;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  contactRole?: string;
  dealName?: string;
  stage?: string;
  value?: string | number;
  probability?: number;
  daysLeft?: number;
  signals?: string[];
  industry?: string;
  tone?: string;
  context?: string; // override — use this exact context if provided
}

// Map generation type to endpoint
const ENDPOINT_MAP: Record<GenerationType, string> = {
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

export const generateAIContent = async (
  params: GenerateParams
): Promise<string> => {

  const {
    type, accountId, accountName = 'Account',
    contactName = 'Contact', contactRole = '',
    dealName = '', stage = 'Qualification',
    value = '$0', probability = 65,
    daysLeft = 30, signals = [],
    industry = 'Technology', tone = 'Formal',
    context,
  } = params;

  const endpoint = ENDPOINT_MAP[type];
  const safeId   = accountId && isValidSalesforceId(accountId)
    ? accountId
    : null; // Upload mode IDs get nulled out

  // Build rich context if none provided
  const richContext = context || buildContext(params);

  // Build request body
  // CRITICAL: if safeId is null (upload mode), send 'upload_mode' as accountId
  // so Salesforce doesn't try to look up ACC001
  // The real intelligence comes from the context string
  const body: Record<string, unknown> = {
    accountId:   safeId || 'upload_mode',
    accountName,
    contactName,
    tone,
    type,
    context:     richContext,
    // Flag so backend knows this is context-only, not a CRM lookup
    dataSource:  safeId ? 'salesforce' : 'uploaded_file',
  };

  // Only add these if we have a real Salesforce ID
  if (safeId) {
    body.dealStage   = stage;
    body.dealValue   = value;
    body.probability = probability;
  }

  const data = await apiPost(endpoint, body);
  return parseAIResponse(data) || generateFallbackContent(params);
};

// Fallback content when API fails — never show empty or raw JSON
const generateFallbackContent = (params: GenerateParams): string => {
  const {
    type, accountName, contactName, stage,
    value, probability = 65, daysLeft = 30, signals = []
  } = params;

  const signalText = signals.length > 0
    ? signals.slice(0, 2).join(', ')
    : 'recent engagement';

  switch (type) {
    case 'followup':
    case 'email':
      return `Subject: Following up — ${accountName}\n\nHi ${contactName},\n\nI wanted to reach out following our recent discussions about your needs at ${accountName}. Based on the ${signalText} we've observed, I believe now is a great time to reconnect.\n\nWould you have 15 minutes this week to discuss how we can help you move forward?\n\nBest regards,\nYour Account Executive`;

    case 'proposal':
      return `SALES PROPOSAL — ${accountName}\n\nEXECUTIVE SUMMARY\nWe propose a customized solution for ${accountName} valued at ${value}.\n\nSOLUTION OVERVIEW\nBased on your requirements, our platform addresses your key challenges in ${params.industry || 'your industry'}.\n\nPROPOSED VALUE\n• Streamlined operations\n• Measurable ROI within 90 days\n• Dedicated implementation support\n\nNEXT STEPS\nSchedule a 30-minute review call to finalize terms.\n\nExpected close: ${daysLeft} days`;

    case 'meetingPrep':
    case 'callprep':
      return `CALL PREPARATION — ${contactName} at ${accountName}\n\nOBJECTIVE\nAdvance the deal from ${stage} stage toward close.\n\nOPENING\n"Hi ${contactName}, thanks for your time. I wanted to discuss where we are and ensure everything is on track from your side."\n\nKEY TALKING POINTS\n1. Reinforce value specific to ${accountName}'s goals\n2. Address any blockers since our last conversation\n3. Confirm timeline — ${daysLeft} days to target close\n\nQUESTIONS TO ASK\n1. What would need to be true to move forward this month?\n2. Are there any internal approvals still pending?\n3. How are you feeling about the proposed solution?\n\nCLOSING\n"What's the best next step from your side to keep momentum going?"`;

    case 'strategy':
    case 'engage':
      return `ENGAGEMENT STRATEGY — ${accountName}\n\nSITUATION\nDeal at ${stage} stage. Win probability: ${probability}%. Days remaining: ${daysLeft}.\nKey signals: ${signalText}.\n\nPRIORITY ACTIONS (Next 48 Hours)\n1. Email ${contactName} with a specific value-add relevant to ${signalText}\n2. Schedule a ${stage === 'Negotiation' ? 'final review' : 'discovery'} call\n3. Prepare ${stage === 'Proposal' ? 'revised proposal' : 'tailored demo'}\n\nKEY RISKS\n• Deal going silent at ${stage} stage\n• Competitor engagement detected\n\nRECOMMENDED NEXT ACTION\n${probability > 70 ? 'Push for commitment — deal is ready to close.' : 'Build urgency and reinforce unique value proposition.'}`;

    default:
      return `AI content for ${accountName} — ${type}.\nContact: ${contactName} | Stage: ${stage} | Value: ${value}`;
  }
};

// Context builder for each type
const buildContext = (params: GenerateParams): string => {
  const {
    type, accountName, contactName, contactRole,
    dealName, stage, value, probability,
    daysLeft, signals, industry, tone
  } = params;

  const signalText = signals?.join(', ') || 'recent engagement';

  const base = `
ACCOUNT: ${accountName}
CONTACT: ${contactName}${contactRole ? ` (${contactRole})` : ''}
DEAL: ${dealName || accountName} | Stage: ${stage} | Value: ${value}
PROBABILITY: ${probability}% | DAYS TO CLOSE: ${daysLeft}
SIGNALS: ${signalText}
INDUSTRY: ${industry}
TONE: ${tone}
`.trim();

  const instructions: Record<GenerationType, string> = {
    followup: `${base}\n\nWrite a personalized follow-up email. Reference the signals specifically. End with one clear CTA. Max 4 short paragraphs. Start directly with greeting.`,
    email: `${base}\n\nWrite a professional sales email appropriate for ${stage} stage. Personalize to ${accountName}. Start directly with greeting.`,
    reengagement: `${base}\n\nWrite a re-engagement email. Lead with something NEW and valuable. Do NOT mention the silence. Max 3 paragraphs. Start directly with greeting.`,
    pricing: `${base}\n\nWrite a pricing details email. Frame pricing as ROI for ${industry}. Include 2-3 tier options briefly. End with a scheduling CTA.`,
    proposal: `${base}\n\nWrite a full sales proposal. Include: Executive Summary, Solution Overview, Key Benefits, ROI Projection, Implementation Timeline, Next Steps. Format with clear section headers.`,
    meetingPrep: `${base}\n\nCreate a complete meeting prep guide. Include: Objective, Opening line, 3 Key Talking Points, 3 Discovery Questions, 2 Likely Objections with responses, Closing statement.`,
    callprep: `${base}\n\nCreate a call preparation guide for ${contactName} (${contactRole}). Include opening, talking points, questions, objection handling, and closing. Plain text with section headers.`,
    strategy: `${base}\n\nCreate a deal advancement strategy. Include: Situation Assessment, Priority Actions for next 48 hours, Key Risks, Recommended Next Action. Plain text with headers.`,
    engage: `${base}\n\nCreate a complete engagement plan. Sections: 1) Outreach Email to ${contactName}, 2) Next 48 Hours Actions (3 specific), 3) Objection Handling (2 objections), 4) Meeting Agenda. Plain text with headers.`,
  };

  return instructions[type] || base;
};
