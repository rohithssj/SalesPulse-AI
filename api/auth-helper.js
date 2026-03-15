/**
 * Shared OAuth helper for Vercel Serverless Functions.
 * Since serverless functions are stateless, we don't do in-memory caching here.
 * Vercel's caching layer can be used if needed, but for simplicity, we refresh
 * when required.
 */
export async function getAccessToken() {
    const CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
    const CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.SALESFORCE_REFRESH_TOKEN;
    const STATIC_TOKEN = process.env.SALESFORCE_TOKEN || process.env.SF_ACCESS_TOKEN;

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.warn('[AUTH] Missing OAuth credentials, falling back to static token');
        return STATIC_TOKEN;
    }

    try {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN
        });

        const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('[AUTH ERROR]', err);
            return STATIC_TOKEN;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('[AUTH ERROR] Exception during refresh:', error.message);
        return STATIC_TOKEN;
    }
}
