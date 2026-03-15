/**
 * Masks a Salesforce org URL for safe display in the UI
 * Input:  https://orgfarm-a0a66fa8a5-dev-ed.develop.my.salesforce.com
 * Output: https://orgfar••••••••.develop.my.salesforce.com
 */
export const maskOrgUrl = (url: string): string => {
  if (!url) return '••••••••.my.salesforce.com';
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const protocol = urlObj.protocol;
    const parts = hostname.split('.');
    const orgPart = parts[0]; // e.g. "orgfarm-a0a66fa8a5-dev-ed"

    // Show first 6 chars, mask the middle, keep last 3 of the org segment
    const visible = orgPart.substring(0, 6);
    const masked = '••••••••';
    const suffix = parts.slice(1).join('.');

    return `${protocol}//${visible}${masked}.${suffix}`;
  } catch {
    return '••••••••.my.salesforce.com';
  }
};

/**
 * Masks an OAuth token for safe display
 * Input:  00D5e000000XXXXX!AQEAQsomeLongTokenString
 * Output: 00D5e0••••••••••••••••••••••••••••XXXX
 */
export const maskToken = (token: string): string => {
  if (!token) return '••••••••••••••••';
  if (token.length <= 10) return '••••••••••••••••';
  return `${token.substring(0, 6)}${'•'.repeat(20)}${token.slice(-4)}`;
};

/**
 * Masks any sensitive string generically
 */
export const maskSensitive = (value: string, visibleStart = 4, visibleEnd = 4): string => {
  if (!value) return '••••••••';
  if (value.length <= visibleStart + visibleEnd) return '••••••••';
  return `${value.substring(0, visibleStart)}${'•'.repeat(12)}${value.slice(-visibleEnd)}`;
};
