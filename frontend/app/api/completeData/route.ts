import { NextRequest, NextResponse } from 'next/server';
import { salesforceRequest } from '@/lib/salesforceClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  // Requirement 3: Strictly return 400 if accountId is missing
  if (!accountId) {
    return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
  }

  try {
    const data = await salesforceRequest('/completeData', { params: { accountId } });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API completeData] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
