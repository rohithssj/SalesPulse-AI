
// Every function returns a DIFFERENT, situation-specific prompt
// so the AI never generates the same content twice

interface DealContext {
  dealName?: string;
  accountName?: string;
  contactName?: string;
  contactRole?: string;
  stage?: string;
  value?: string | number;
  probability?: number;
  daysLeft?: number;
  signals?: string[];
  industry?: string;
  keyPoints?: string[];
  attendees?: string[];
  followUpActions?: string[];
}

// ── EMAIL CONTEXTS ── each one forces completely different output

export const buildFollowUpContext = (ctx: DealContext) => `
You are a senior B2B sales rep at a SaaS company writing a follow-up email.

ACCOUNT: ${ctx.accountName}
CONTACT: ${ctx.contactName || 'Decision Maker'} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}
DEAL: ${ctx.dealName || ctx.accountName} | Stage: ${ctx.stage} | Value: ${ctx.value}
DAYS TO CLOSE: ${ctx.daysLeft} days | WIN PROBABILITY: ${ctx.probability}%
BUYING SIGNALS: ${ctx.signals?.join(', ') || 'Recent engagement'}

Write a follow-up email that:
- Opens with a SPECIFIC reference to something from their recent interaction (not generic)
- Middle section addresses their specific situation at ${ctx.stage} stage
- Ends with ONE clear call-to-action appropriate for ${ctx.daysLeft} days remaining
- Tone must match ${ctx.probability && ctx.probability > 70 ? 'high confidence — this deal is close to closing' : 'nurturing — building trust and momentum'}
- Maximum 4 short paragraphs
- NO generic phrases like "I wanted to follow up" or "as per our discussion"
- Sign off as: [Your Name], Account Executive

Return ONLY the email text. No JSON. No subject line label. Start directly with the greeting.`;

export const buildPricingEmailContext = (ctx: DealContext) => `
You are a senior sales rep writing a pricing details email.

ACCOUNT: ${ctx.accountName} | INDUSTRY: ${ctx.industry || 'Technology'}
CONTACT: ${ctx.contactName} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}
DEAL VALUE RANGE: ${ctx.value}
STAGE: ${ctx.stage}

Write a pricing email that:
- Opens by acknowledging their specific pricing inquiry (not generic)
- Presents pricing in terms of VALUE and ROI for a ${ctx.industry || 'technology'} company, not just numbers
- Includes 2-3 tier options briefly described
- Addresses the most common pricing objection for a ${ctx.contactRole || 'decision maker'} level contact
- Ends with a specific next step (pricing call, custom quote, etc.)
- Confident and consultative tone — NOT salesy

Return ONLY the email text. No JSON. Start directly with the greeting.`;

export const buildReengagementContext = (ctx: DealContext) => `
You are a senior sales rep re-engaging a prospect who went silent.

ACCOUNT: ${ctx.accountName} 
CONTACT: ${ctx.contactName}
SILENCE DURATION: 14+ days
LAST STAGE: ${ctx.stage}
DEAL VALUE: ${ctx.value}

Write a re-engagement email that:
- Does NOT reference the silence directly or apologize for it
- Leads with something NEW and genuinely valuable — a relevant industry insight, case study, or data point for their ${ctx.industry || 'industry'}
- Shows you understand their world changed — reference potential pain points they face right now
- Makes it EASY to respond — low-friction ask (a quick yes/no or a 10-minute chat)
- Tone: warm, confident, not desperate
- Maximum 3 paragraphs

Return ONLY the email text. No JSON. Start directly with the greeting.`;

export const buildProposalEmailContext = (ctx: DealContext) => `
You are a senior sales rep sending a customized sales proposal email.

ACCOUNT: ${ctx.accountName} | INDUSTRY: ${ctx.industry || 'Technology'}
CONTACT: ${ctx.contactName} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}
DEAL: ${ctx.dealName} | VALUE: ${ctx.value}
SIGNALS: ${ctx.signals?.join(', ') || 'Requested proposal'}

Write a proposal cover email that:
- Opens with 1 sentence that proves you understand their SPECIFIC business situation
- Summarizes the proposed solution in 2-3 bullet points tailored to their signals: ${ctx.signals?.join(', ')}
- States a clear expected outcome/ROI specific to a ${ctx.industry || 'technology'} company
- Next step: schedule a 30-minute review call with specific urgency tied to their ${ctx.daysLeft}-day timeline
- Formal but warm tone appropriate for ${ctx.contactRole || 'executive'} level

Return ONLY the email text. No JSON. Start directly with the greeting.`;

export const buildEngagementPlanContext = (ctx: DealContext) => `
You are a senior sales strategist creating a deal engagement plan.

DEAL: ${ctx.dealName} | ACCOUNT: ${ctx.accountName}
STAGE: ${ctx.stage} | VALUE: ${ctx.value}
PROBABILITY: ${ctx.probability}% | DAYS REMAINING: ${ctx.daysLeft}
PRIMARY CONTACT: ${ctx.contactName} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}

Create a specific engagement plan with these FOUR sections:

OUTREACH EMAIL
Write a complete email to ${ctx.contactName} that is appropriate for ${ctx.stage} stage.
${ctx.probability && ctx.probability > 75
  ? 'Focus on closing — this deal is nearly done. Address final blockers.'
  : ctx.stage?.toLowerCase().includes('negotiation')
  ? 'Focus on resolving the final negotiation points. Protect deal value.'
  : 'Focus on advancing to next stage. Build urgency.'}

NEXT 48 HOURS — 3 ACTIONS
List exactly 3 specific actions for the sales rep to take TODAY and TOMORROW.
Each action must have: what to do, who to contact, expected outcome.

OBJECTION HANDLING
List 2 objections most likely at ${ctx.stage} stage and exact word-for-word responses.

MEETING AGENDA
A 30-minute meeting structure: opening (5min), discovery/review (15min), close/next step (10min).
Include specific questions for ${ctx.contactName}.

Format as plain text with section headers. No JSON. No bullet asterisks.`;

export const buildCallPrepContext = (ctx: DealContext) => `
You are preparing a sales rep for a call with ${ctx.contactName}.

ACCOUNT: ${ctx.accountName} | CONTACT: ${ctx.contactName} (${ctx.contactRole})
DEAL STAGE: ${ctx.stage} | VALUE: ${ctx.value} | PROBABILITY: ${ctx.probability}%
STATUS: ${ctx.signals?.includes('engaged') ? 'Actively engaged' : 'Needs re-engagement'}

Create a complete call preparation guide:

CALL OBJECTIVE
One sentence: what must be achieved on this specific call.

OPENING (first 30 seconds)
Write the exact opening line the rep should say.
Must reference something specific about ${ctx.accountName} or ${ctx.contactName}'s role.

KEY TALKING POINTS — 3 points
Each tailored to a ${ctx.contactRole} at a ${ctx.stage} stage deal.
Include what matters most to someone in their role.

QUESTIONS TO ASK — 3 questions  
Discovery or advancement questions specific to ${ctx.stage} stage.
Questions that uncover blockers or accelerate the deal.

LIKELY OBJECTIONS — 2
Most common objections a ${ctx.contactRole} raises at ${ctx.stage} stage.
Include exact response for each.

CALL CLOSE
Exact words to end the call with a committed next step.

Format as plain readable text with section headers. No JSON.`;

export const buildAITipsContext = (ctx: DealContext) => `
You are a B2B sales coach giving tactical advice.

DEAL: ${ctx.dealName} | ACCOUNT: ${ctx.accountName}
STAGE: ${ctx.stage} | VALUE: ${ctx.value}
PROBABILITY: ${ctx.probability}% | DAYS LEFT: ${ctx.daysLeft}
CONTACT: ${ctx.contactName} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}

${getStageSpecificTipsPrompt(ctx)}

RULES:
- Each tip must be actionable TODAY — not generic advice
- Reference specific numbers: ${ctx.probability}%, ${ctx.daysLeft} days, ${ctx.value}
- Address the REAL risk at ${ctx.stage} stage specifically
- NO generic phrases like "build rapport" or "follow up regularly"
- Each tip: 2-3 sentences maximum

Format: numbered list 1-4. Plain text. No JSON.`;

const getStageSpecificTipsPrompt = (ctx: DealContext): string => {
  const stage = (ctx.stage || '').toLowerCase();

  if (stage.includes('negotiation')) return `
Give 4 NEGOTIATION-SPECIFIC tips:
1. One tip about protecting the ${ctx.value} deal value from discount pressure
2. One tip about identifying who the real final decision maker is at ${ctx.accountName}
3. One tip about creating urgency when ${ctx.daysLeft} days remain without being pushy
4. One tip about what to do if ${ctx.contactName} goes silent during negotiations`;

  if (stage.includes('proposal')) return `
Give 4 PROPOSAL-SPECIFIC tips:
1. One tip about making this proposal stand out vs competitors at ${ctx.accountName}
2. One tip about the most common reason proposals get rejected at this stage and how to prevent it
3. One tip about following up on the proposal without being annoying
4. One tip about accelerating the decision when ${ctx.daysLeft} days remain`;

  if (stage.includes('prospect')) return `
Give 4 PROSPECTING-SPECIFIC tips:
1. One tip about the fastest way to qualify ${ctx.accountName} as a real opportunity
2. One tip about the best discovery question to ask ${ctx.contactName} this week
3. One tip about differentiating before competitors engage with this account
4. One tip about what content to share to build credibility quickly`;

  if (stage.includes('qualif')) return `
Give 4 QUALIFICATION-SPECIFIC tips:
1. One tip about identifying the real budget holder at ${ctx.accountName} beyond ${ctx.contactName}
2. One tip about the biggest qualification red flag at this stage and how to check for it
3. One tip about accelerating to Proposal stage in the next ${Math.min(ctx.daysLeft || 14, 14)} days
4. One tip about confirming the business case is strong enough to justify ${ctx.value}`;

  if (stage.includes('closing') || stage.includes('closed')) return `
Give 4 CLOSING-SPECIFIC tips:
1. One tip about the most common reason ${ctx.value} deals stall at closing stage
2. One tip about what to do if ${ctx.contactName} suddenly stops responding
3. One tip about creating legitimate urgency to sign before the ${ctx.daysLeft}-day deadline
4. One tip about managing internal stakeholders at ${ctx.accountName} during final approval`;

  return `
Give 4 tactical tips specific to advancing this ${ctx.stage} stage deal:
1. The single most important thing to do in the next 48 hours
2. The biggest risk that could kill this deal and how to mitigate it  
3. How to use the ${ctx.probability}% probability context in your next conversation
4. The right next step to advance this to the next stage`;
};

export const buildMeetingSummaryContext = (ctx: DealContext) => `
You are creating a professional meeting summary document.

ACCOUNT: ${ctx.accountName} | MEETING TYPE: Sales review
CONTACT: ${ctx.contactName} ${ctx.contactRole ? `(${ctx.contactRole})` : ''}
DEAL: ${ctx.dealName} | STAGE: ${ctx.stage} | VALUE: ${ctx.value}
SIGNALS DISCUSSED: ${ctx.signals?.join(', ') || 'General review'}

Write a professional meeting summary including:

MEETING OVERVIEW
Date: ${new Date().toLocaleDateString()}, Participants: ${ctx.attendees?.join(', ') || 'Team'}, Purpose: Sales review

KEY DISCUSSION POINTS — ${ctx.keyPoints?.length || 4} points
${ctx.keyPoints?.map(p => `- ${p}`).join('\n') || (ctx.signals?.map(s => `- ${s}`).join('\n')) || 'General review'}

DECISIONS MADE
${ctx.keyPoints?.length ? 'Concrete decisions based on discussion points' : 'Strategic alignment on deal progression'}

ACTION ITEMS
${ctx.followUpActions?.map(a => `- ${a} | Rep | Next 48h`).join('\n') || '- Send follow-up summary | You | Today'}

NEXT STEPS
The single most important next milestone and its deadline

Format: clean professional document. Plain text with headers. No JSON.`;
