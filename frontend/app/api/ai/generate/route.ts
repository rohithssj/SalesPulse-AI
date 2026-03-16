import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai/openrouter';
import * as generators from '@/lib/ai/generators';

/**
 * API route to handle all AI generation requests.
 * Uses OpenRouter (DeepSeek) for response generation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data, emailContent, lastEmail, recipientRole } = body;

    if (!type) {
      return NextResponse.json({ error: 'Generation type is required' }, { status: 400 });
    }

    let prompt = '';

    // Route to the correct prompt generator based on requested type
    switch (type) {
      case 'accountBrief':
        prompt = generators.generateAccountBriefPrompt(data);
        break;
      case 'followUp':
        prompt = generators.generateFollowUpEmailPrompt(data);
        break;
      case 'dealSummary':
        prompt = generators.generateDealSummaryPrompt(data);
        break;
      case 'proposal':
        prompt = generators.generateProposalPrompt(data);
        break;
      case 'strategy':
        prompt = generators.generateSalesStrategyPrompt(data);
        break;
      case 'teamOutreach':
        prompt = generators.generateTeamOutreachPrompt(data, recipientRole);
        break;
      case 'callPrep':
        prompt = generators.generateCallPrepPrompt(data);
        break;
      case 'quickDraft':
        prompt = generators.generateQuickDraftPrompt(data, emailContent);
        break;
      case 'suggestedResponse':
        prompt = generators.generateSuggestedResponsePrompt(data, lastEmail);
        break;
      default:
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

    // Call OpenRouter API
    const result = await generateAIResponse(prompt);

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('[API ai/generate] Final Error:', error.message);
    return NextResponse.json(
      { error: 'AI generation temporarily unavailable.' },
      { status: 500 }
    );
  }
}
