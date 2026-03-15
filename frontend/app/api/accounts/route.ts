import { NextResponse } from 'next/server';
import { getSalesforceAccessToken } from '@/lib/salesforce';

export async function GET() {
  const INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || process.env.INSTANCE_URL || process.env.REACT_APP_SF_ORG_URL;
  const APEX_BASE_URL = `${INSTANCE_URL}/services/apexrest/salesforge`;

  try {
    const token = await getSalesforceAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing Salesforce token' }, { status: 401 });
    }

    const response = await fetch(`${APEX_BASE_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('[API accounts] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
