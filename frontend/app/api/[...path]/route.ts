import { NextRequest, NextResponse } from 'next/server';
import { salesforceRequest } from '@/lib/salesforceClient';

/**
 * Catch-all route for other Salesforce API actions (email, proposal, accountBrief, etc.)
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
  
  try {
    const targetParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      targetParams[key] = value;
    });

    let accountId = targetParams.accountId;

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

    // Requirement 3: Strictly return 400 if accountId is missing (except for 'accounts' listing)
    if (!accountId && action !== 'accounts') {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    let data: any;
    if (req.method === 'POST') {
      data = await salesforceRequest(`/${action}`, { 
        method: 'POST',
        body: JSON.stringify({ ...body, accountId }) 
      });
    } else {
      // For GET, ensure accountId is in targetParams if it's not 'accounts'
      if (accountId) targetParams.accountId = accountId;
      data = await salesforceRequest(`/${action}`, { params: targetParams });
    }

    return NextResponse.json(data || {});

  } catch (error: any) {
    console.error(`[API ${action}] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
