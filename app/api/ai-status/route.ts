import { NextResponse } from 'next/server';
import { isLocalDevAiEnabled } from '@/lib/serverAiConfig';

export const dynamic = 'force-dynamic';
export function GET() {
  return NextResponse.json({ localDevConfigured: isLocalDevAiEnabled() }, { headers: { 'Cache-Control': 'no-store' } });
}
