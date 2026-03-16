import { NextResponse } from 'next/server';
import { sfClient } from '@/lib/salesforceClient';

export async function GET() {
  try {
    const response = await sfClient.get('/accounts');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch accounts' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API accounts] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
