import { NextRequest, NextResponse } from 'next/server';
import { hermesGet } from '@hermes/api';

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? undefined;
  const { data, status } = await hermesGet('sys/status', cookie);
  return NextResponse.json(data, { status });
}
