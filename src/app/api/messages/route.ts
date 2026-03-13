import { NextRequest, NextResponse } from 'next/server';
import { hermesPost } from '@/lib/hermesApi';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, status } = await hermesPost('message', body);
  return NextResponse.json(data, { status });
}
