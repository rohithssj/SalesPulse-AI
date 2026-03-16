// lib/aiGenerator.ts
'use client';

import { parseAIResponse } from './api';

const PROXY_BASE = process.env.NEXT_PUBLIC_PROXY_URL || process.env.REACT_APP_SF_PROXY_URL || '';

export type GenerationType =
  | 'email' | 'followup' | 'proposal' | 'meetingPrep'
  | 'strategy' | 'engage' | 'reengagement' | 'pricing' | 'callprep'
  | 'accountBrief' | 'dealSummary' | 'teamOutreach' | 'quickDraft' | 'suggestedResponse';

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
  // Extended context for AI
  emailContent?: string;
  lastEmail?:    string;
  recipientRole?: string;
  previousInteractions?: string;
  dealNotes?:    string;
  painPoints?:   string;
  teamMembers?:  string;
  emailHistory?: string;
}

/**
 * Maps legacy GenerationType to new API types
 */
const mapToNewType = (type: GenerationType): string => {
  switch (type) {
    case 'email':     return 'followUp';
    case 'followup':  return 'followUp';
    case 'proposal':   return 'proposal';
    case 'strategy':   return 'strategy';
    case 'callprep':   return 'callPrep';
    case 'meetingPrep':return 'dealSummary';
    case 'reengagement': return 'followUp';
    default:           return type;
  }
};

/**
 * MAIN EXPORT: Calls the new AI generation service
 */
export const generateAIContent = async (
  params: GenerateParams
): Promise<string> => {
  const { type, ...rest } = params;
  
  console.log(`[aiGenerator] Generating ${type} via /api/ai/generate`);

  try {
    const res = await fetch(`${PROXY_BASE}/api/ai/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        type: mapToNewType(type),
        data: {
          companyName: params.accountName,
          industry:    params.industry,
          dealValue:    params.value,
          dealStage:    params.stage,
          contactName:  params.contactName,
          contactRole:  params.contactRole,
          previousInteractions: params.previousInteractions || (params.signals ? params.signals.join(', ') : ''),
          dealNotes:    params.dealNotes || params.context,
          painPoints:   params.painPoints,
          teamMembers:  params.teamMembers,
          emailHistory: params.emailHistory,
          tone:         params.tone as any,
        },
        emailContent:  params.emailContent,
        lastEmail:     params.lastEmail,
        recipientRole: params.recipientRole,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[aiGenerator] ${res.status} error:`, errText);
      return 'AI generation temporarily unavailable.';
    }

    const data = await res.json();
    return data.result || 'AI generation temporarily unavailable.';

  } catch (err) {
    console.warn('[aiGenerator] Network error:', err);
    return 'AI generation temporarily unavailable.';
  }
};
