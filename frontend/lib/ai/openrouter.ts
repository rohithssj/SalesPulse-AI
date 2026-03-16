/**
 * Core utility for calling OpenRouter API
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Simple in-memory cache for rate limiting (prevents repeat calls within 3 seconds)
let lastCallTime = 0;
let lastResult: string | null = null;
let lastPrompt: string | null = null;

/**
 * Calls OpenRouter AI API with the provided prompt.
 * Configured for DeepSeek Chat model.
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  const now = Date.now();
  
  // Rate limiting & duplicate prevention (3 seconds)
  if (now - lastCallTime < 3000 && prompt === lastPrompt && lastResult) {
    console.log('[AI Service] Returning cached result due to rate limiting.');
    return lastResult;
  }

  if (!OPENROUTER_API_KEY) {
    console.error('[AI Service] OPENROUTER_API_KEY is missing.');
    return 'AI generation temporarily unavailable.';
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://salespulseai.vercel.app',
        'X-Title': 'SalesPulse AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: 'You are SalesPulse AI, a powerful sales intelligence engine. Generate contextual, professional, and actionable responses based on CRM data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AI Service] OpenRouter API Error:', response.status, errorData);
      return 'AI generation temporarily unavailable.';
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    if (!result) {
      console.warn('[AI Service] AI returned empty result.');
      return 'AI generation temporarily unavailable.';
    }

    // Update cache
    lastCallTime = now;
    lastPrompt = prompt;
    lastResult = result;

    return result;
  } catch (error) {
    console.error('[AI Service] Network error:', error);
    return 'AI generation temporarily unavailable.';
  }
}
