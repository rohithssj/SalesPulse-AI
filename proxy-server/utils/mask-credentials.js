/**
 * Masks a Salesforce org URL for safe display
 */
export const maskOrgUrl = (url) => {
  if (!url) return '••••••••.my.salesforce.com';
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    const orgPart = parts[0];

    const visible = orgPart.substring(0, 6);
    const masked = '••••••••';
    const suffix = parts.slice(1).join('.');

    return `${urlObj.protocol}//${visible}${masked}.${suffix}`;
  } catch {
    return '••••••••.my.salesforce.com';
  }
};

/**
 * Masks an OAuth token for safe display
 */
export const maskToken = (token) => {
  if (!token) return '••••••••••••••••';
  if (token.length <= 10) return '••••••••••••••••';
  return `${token.substring(0, 6)}${'•'.repeat(20)}${token.slice(-4)}`;
};
