import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceAccessToken } from '@/lib/salesforce';

/**
 * Catch-all route for other Salesforce API actions (email, proposal, etc.)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(req, path);
}

async function handleRequest(req: NextRequest, pathSegments: string[]) {
  const action = pathSegments[pathSegments.length - 1];
  const { searchParams } = new URL(req.url);
  
  const INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
  const APEX_BASE_URL = `${INSTANCE_URL}/services/apexrest/salesforge`;

  try {
    const token = await getSalesforceAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing Salesforce token' }, { status: 401 });
    }

    // Clone search params to forward them
    const targetParams = new URLSearchParams(searchParams);
    let accountId = targetParams.get('accountId');

    // Parse body for accountId if it's a POST
    let body: any = null;
    if (req.method === 'POST') {
      try {
        body = await req.json();
        if (body && body.accountId) {
          accountId = body.accountId;
        }
      } catch (e) {
        // Body might be empty or not JSON
      }
    }

    // If accountId is still missing and this isn't the accounts endpoint, try to find a default
    if (!accountId && action !== 'accounts') {
      const accountsRes = await fetch(`${APEX_BASE_URL}/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        if (accounts && accounts.length > 0) {
          accountId = accounts[0].Id;
          if (accountId) {
            targetParams.set('accountId', accountId);
          }
        }
      }
    }

    const targetUrl = new URL(`${APEX_BASE_URL}/${action}`);
    if (accountId) {
      targetUrl.searchParams.set('accountId', accountId);
    }
    
    // Forward other query params except accountId (since we just set/overrode it)
    searchParams.forEach((value, key) => {
      if (key !== 'accountId') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error(`[API ${action}] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
