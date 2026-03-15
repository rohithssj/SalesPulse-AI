import axios from 'axios';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Gets a fresh Salesforce access token using the refresh token flow.
 * Caches the token in memory to avoid redundant requests.
 */
export async function getAccessToken() {
    const CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
    const CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.SALESFORCE_REFRESH_TOKEN;
    const INSTANCE_URL = process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;

    // 1. Check if we have a valid cached token (with 1-minute buffer)
    if (cachedToken && Date.now() < tokenExpiry - 60000) {
        return cachedToken;
    }

    // 2. Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.error('❌ Missing OAuth credentials in env (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN)');
        // Fallback to static token for backward compatibility if available
        return process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;
    }

    console.log('[AUTH] Requesting new Salesforce access token...');

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('refresh_token', REFRESH_TOKEN);

        const response = await axios.post('https://login.salesforce.com/services/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, instance_url } = response.data;

        // Cache the token
        cachedToken = access_token;
        // OAuth tokens generally don't have an explicit 'expiry' in the response, 
        // but they usually last 2 hours. We'll set a conservative 1-hour cache.
        tokenExpiry = Date.now() + (3600 * 1000); 

        console.log('✅ Token refreshed successfully');
        return access_token;

    } catch (error) {
        console.error('[AUTH ERROR] Failed to refresh token:', error.response?.data || error.message);
        // Fallback to static token as last resort
        return process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;
    }
}
