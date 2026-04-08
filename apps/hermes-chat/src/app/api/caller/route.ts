import { NextRequest, NextResponse } from 'next/server';
import { hermesGet } from '@/lib/hermesApi';

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? undefined;
  const { data, status } = await hermesGet('caller', cookie);
  return NextResponse.json(data, { status });
}
