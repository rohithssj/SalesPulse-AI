/**
 * Shared utility for Salesforce OAuth authentication in Next.js Serverless Functions.
 */

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Gets a fresh Salesforce access token using the refresh token flow.
 * Caches the token in memory (for the duration of the serverless execution/reuse).
 */
export async function getSalesforceAccessToken(): Promise<string | null> {
  const CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
  const CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SALESFORCE_REFRESH_TOKEN;
  const INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;

  // 1. Check if we have a valid cached token (with 1-minute buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  // 2. Validate environment variables
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.warn('[SALESFORCE AUTH] Missing OAuth credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN)');
    // Fallback to static token for backward compatibility in dev
    return process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN || null;
  }

  console.log('[SALESFORCE AUTH] Requesting new access token...');

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('refresh_token', REFRESH_TOKEN);

    // Using standard fetch since we're in Next.js/Node environment
    const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Salesforce token refresh failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const { access_token } = data;

    // Cache the token
    cachedToken = access_token;
    // OAuth tokens generally don't have an explicit 'expiry' in the response, 
    // but they usually last 2 hours. We'll set a conservative 1-hour cache.
    tokenExpiry = Date.now() + (3600 * 1000);

    console.log('[SALESFORCE AUTH] Token refreshed successfully');
    return access_token;

  } catch (error: any) {
    console.error('[SALESFORCE AUTH ERROR] Failed to refresh token:', error.message);
    // Fallback to static token as last resort
    return process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN || null;
  }
}
