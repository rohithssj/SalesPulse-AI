/**
 * Universal parser to handle various Salesforce Apex response shapes
 * and prevent "null" or [object Object] displays in the UI.
 */
export const parseApiResponse = (data: any): string => {
  // If null or undefined
  if (data === null || data === undefined) {
    return 'No content was returned from the AI. Please try again.';
  }

  // If it's already a plain string
  if (typeof data === 'string' && data.trim() !== '' && data !== 'null') {
    return data.trim();
  }

  // If it's a string "null" or "undefined"
  if (data === 'null' || data === 'undefined') {
    return 'AI response was empty. Please check your Salesforce connection.';
  }

  // If it's an object, try to extract content from known fields
  if (typeof data === 'object') {
    // Anthropic-style content array
    if (Array.isArray(data.content)) {
      const textBlocks = data.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');
      if (textBlocks) return textBlocks;
    }

    // Direct array of strings
    if (Array.isArray(data)) {
      return data.join('\n');
    }

    // Common Apex response field names in priority order
    const fieldPriority = [
      'result', 'content', 'data', 'output', 'message',
      'strategy', 'strategyContent', 'emailContent', 'email',
      'proposal', 'summary', 'brief', 'tips', 'text',
      'body', 'response', 'generatedContent', 'aiContent',
      'engagementPlan', 'meetingSummary', 'accountBrief'
    ];

    for (const field of fieldPriority) {
      if (data[field]) {
        // Handle nested fields (e.g., data.email.body)
        if (typeof data[field] === 'string' && data[field].trim() !== '' && data[field] !== 'null') {
          return data[field].trim();
        }
        if (typeof data[field] === 'object' && data[field] !== null) {
          // Recursive call for nested object if it's not the same object
          const nested = parseApiResponse(data[field]);
          if (nested && !nested.includes('empty') && !nested.includes('No content')) {
            return nested;
          }
        }
      }
    }

    // fallback for email.body specifically
    if (data.email?.body) return data.email.body;

    // Last resort — stringify for debugging
    const stringified = JSON.stringify(data, null, 2);
    if (stringified !== '{}' && stringified !== 'null') {
      return stringified;
    }
  }

  return 'AI response was empty. Please try again.';
};
