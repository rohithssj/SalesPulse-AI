import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceAccessToken } from '@/lib/salesforce';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let accountId = searchParams.get('accountId');

  const INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
  const APEX_BASE_URL = `${INSTANCE_URL}/services/apexrest/salesforge`;

  try {
    const token = await getSalesforceAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing Salesforce token' }, { status: 401 });
    }

    // If accountId is missing, try to fetch the first available account
    if (!accountId) {
      const accountsRes = await fetch(`${APEX_BASE_URL}/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        if (accounts && accounts.length > 0) {
          accountId = accounts[0].Id;
        }
      }
    }

    if (!accountId) {
      return NextResponse.json({ error: 'No account ID provided or found' }, { status: 400 });
    }

    const response = await fetch(`${APEX_BASE_URL}/completeData?accountId=${accountId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('[API completeData] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
