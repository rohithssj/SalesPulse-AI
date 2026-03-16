/**
 * Structured prompt generators for various SalesPulse AI features
 */

interface CRMDataContext {
  companyName?: string;
  industry?: string;
  dealValue?: string | number;
  dealStage?: string;
  contactName?: string;
  contactRole?: string;
  previousInteractions?: string;
  dealNotes?: string;
  painPoints?: string;
  teamMembers?: string;
  emailHistory?: string;
  tone?: 'Formal' | 'Friendly' | 'Persuasive';
}

/**
 * Formats CRM data into a legible context string for the AI
 */
function buildContextString(data: CRMDataContext): string {
  return `
Company Name: ${data.companyName || 'N/A'}
Industry: ${data.industry || 'N/A'}
Deal Value: ${data.dealValue || 'N/A'}
Deal Stage: ${data.dealStage || 'N/A'}
Contact Name: ${data.contactName || 'N/A'}
Contact Role: ${data.contactRole || 'N/A'}
Previous Interactions: ${data.previousInteractions || 'N/A'}
Deal Notes: ${data.dealNotes || 'N/A'}
Pain Points: ${data.painPoints || 'N/A'}
Team Members: ${data.teamMembers || 'N/A'}
Email History: ${data.emailHistory || 'N/A'}
`.trim();
}

/**
 * 1. Account Intelligence Brief
 */
export function generateAccountBriefPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  return `
Analyze the following company data and generate a structured Account Intelligence Brief.
Return the result in clean structured text. Avoid markdown.

DATA CONTEXT:
${context}

REQUIRED SECTIONS:
- Company Overview: 2-3 sentences about the company and its business.
- Industry Insights: Current trends or challenges in their industry.
- Key Decision Makers: Roles and importance of mentioned contacts.
- Potential Risks: Challenges that might stall the deal.
- Sales Opportunities: Where we can add the most value.
- Recommended Next Actions: 3 specific tactical steps.
`.trim();
}

/**
 * 2. Follow Up Email Generator
 */
export function generateFollowUpEmailPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  const tone = data.tone || 'Formal';
  return `
Generate a personalized follow-up email based on the following deal context.
The tone should be: ${tone}. Start directly with the greeting. Avoid markdown.

DATA CONTEXT:
${context}

REQUIREMENTS:
- Reference specific previous interactions or pain points.
- Align with the current deal stage (${data.dealStage}).
- Clear call-to-action.
- Maintain a ${tone} writing style.
`.trim();
}

/**
 * 3. Deal Summary Generator
 */
export function generateDealSummaryPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  return `
Generate a concise Deal Summary based on the information provided.
Return plain text only. Avoid markdown.

DATA CONTEXT:
${context}

REQUIRED SECTIONS:
- Deal Background
- Client Needs
- Current Status
- Key Stakeholders
- Next Steps
`.trim();
}

/**
 * 4. Proposal Generator
 */
export function generateProposalPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  const tone = data.tone || 'Formal';
  return `
Generate a full structured sales proposal. 
The tone should be: ${tone}. Avoid markdown except for section headers.

DATA CONTEXT:
${context}

REQUIRED SECTIONS:
- Introduction
- Client Pain Points
- Proposed Solution
- Benefits
- Pricing Justification
- Closing CTA
`.trim();
}

/**
 * 5. Strategy Agent
 */
export function generateSalesStrategyPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  return `
Generate a Long-Term Sales Strategy for this account.
Return plain text only. Avoid markdown.

DATA CONTEXT:
${context}

REQUIRED SECTIONS:
- Relationship Building Strategy
- Upsell Opportunities
- Expansion Opportunities
- Risk Mitigation
- Quarterly Action Plan (Split by Month 1, 2, 3)
`.trim();
}

/**
 * 6. Team Outreach Email (Deals Section)
 */
export function generateTeamOutreachPrompt(data: CRMDataContext, recipientRole: string): string {
  const context = buildContextString(data);
  return `
Generate an internal email to a team member (${recipientRole}) regarding this deal.
Avoid markdown.

DATA CONTEXT:
${context}

REQUIREMENTS:
- Explain current deal status.
- Outline required actions from their specific role (${recipientRole}).
- Define clear responsibilities and deadlines.
`.trim();
}

/**
 * 7. Call Talking Points (Deals Section)
 */
export function generateCallPrepPrompt(data: CRMDataContext): string {
  const context = buildContextString(data);
  return `
Generate call preparation talking points for the upcoming interaction with ${data.contactName}.
Return plain text only. Avoid markdown.

DATA CONTEXT:
${context}

REQUIRED SECTIONS:
- Agenda
- Key Talking Points
- Objection Responses
- Deal Closing Tactics
`.trim();
}

/**
 * 8. Quick Draft Response (Email Activity Alerts)
 */
export function generateQuickDraftPrompt(data: CRMDataContext, emailContent: string): string {
  const context = buildContextString(data);
  return `
Generate a contextual quick draft reply to the following email.
Use the deal context and CRM data to make it relevant. Avoid markdown.

INCOMING EMAIL:
"${emailContent}"

DATA CONTEXT:
${context}

REQUIREMENTS:
- Friendly but professional.
- Address the sender's points.
- Move the deal forward.
`.trim();
}

/**
 * 9. AI-Suggested Response (Deal Details)
 */
export function generateSuggestedResponsePrompt(data: CRMDataContext, lastEmail: string): string {
  const context = buildContextString(data);
  return `
Read the deal context and the previous email content, then generate an appropriate reply.
Return ONLY the email body. Avoid markdown.

PREVIOUS EMAIL:
"${lastEmail}"

DATA CONTEXT:
${context}
`.trim();
}
