/**
 * salesforceClient.ts
 * Centralized Salesforce API client with auto-token refresh logic.
 */

import { getSalesforceAccessToken, clearSalesforceCache } from './salesforce';

interface SalesforceRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class SalesforceClient {
  private static instance: SalesforceClient;
  private instanceUrl: string;
  private apexBaseUrl: string;

  private constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || process.env.INSTANCE_URL || '';
    this.apexBaseUrl = `${this.instanceUrl}/services/apexrest/salesforge`;
  }

  public static getInstance(): SalesforceClient {
    if (!SalesforceClient.instance) {
      SalesforceClient.instance = new SalesforceClient();
    }
    return SalesforceClient.instance;
  }

  /**
   * Performs a fetch to Salesforce Apex REST endpoint with automatic token handling and retry.
   */
  public async request(endpoint: string, options: SalesforceRequestOptions = {}): Promise<Response> {
    const { params, ...fetchOptions } = options;
    
    // 1. Get current token
    let token = await getSalesforceAccessToken();
    if (!token) {
      throw new Error('Unauthorized: No Salesforce token available');
    }

    // 2. Build URL
    let url = endpoint.startsWith('http') ? endpoint : `${this.apexBaseUrl}${endpoint}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    }

    // 3. Helper to make request
    const makeRequest = async (tokenToUse: string) => {
      return fetch(url, {
        ...fetchOptions,
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
    };

    // 4. Initial Request
    let response = await makeRequest(token);

    // 5. Handle Token Expiry (401 Unauthorized)
    if (response.status === 401) {
      let errorData;
      try {
        const clone = response.clone();
        errorData = await clone.json();
      } catch (e) {
        errorData = {};
      }

      const isInvalidSession = 
        errorData.errorCode === 'INVALID_SESSION_ID' || 
        (Array.isArray(errorData) && errorData[0]?.errorCode === 'INVALID_SESSION_ID') ||
        errorData.message === 'Session expired or invalid';

      if (isInvalidSession) {
        console.warn(`[SalesforceClient] Session expired on ${endpoint}, clearing cache and refreshing...`);
        clearSalesforceCache();
        
        token = await getSalesforceAccessToken(); 
        
        if (token) {
          console.log(`[SalesforceClient] Retrying ${endpoint} with new token...`);
          response = await makeRequest(token);
        }
      }
    }

    // 6. Enhanced Error Logging on Failure
    if (!response.ok) {
      const clone = response.clone();
      const body = await clone.text().catch(() => 'no body');
      console.error('[SalesforceClient ERROR]', {
        endpoint: url,
        status: response.status,
        statusText: response.statusText,
        body
      });
    }

    return response;
  }

  public async get(endpoint: string, params?: Record<string, string>, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET', params });
  }

  public async post(endpoint: string, body: any, params?: Record<string, string>, options: RequestInit = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      params,
      body: JSON.stringify(body) 
    });
  }

  // Specialized fetch functions
  public async fetchAccounts() {
    const res = await this.get('/accounts');
    return res.json();
  }

  public async fetchAccountDetails(accountId: string) {
    const res = await this.get(`/accountBrief?accountId=${accountId}`);
    return res.json();
  }

  public async fetchOpportunities(accountId: string) {
    const res = await this.get(`/completeData?accountId=${accountId}`);
    const data = await res.json();
    return data.opportunities || [];
  }

  public async fetchActivities(accountId: string) {
    const res = await this.get(`/completeData?accountId=${accountId}`);
    const data = await res.json();
    return data.activities || [];
  }
}

export const sfClient = SalesforceClient.getInstance();

/**
 * Global Salesforce Request Wrapper
 * Requirement 2: Create a reusable salesforceRequest(endpoint: string)
 */
export async function salesforceRequest(endpoint: string, options: SalesforceRequestOptions = {}) {
  const response = await sfClient.request(endpoint, options);
  if (!response.ok) {
    throw new Error(`Salesforce request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
