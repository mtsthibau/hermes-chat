import { NextRequest, NextResponse } from 'next/server';
import { hermesPost } from '@hermes/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookie = request.headers.get('cookie') ?? undefined;
  const { id } = await params;
  const body = await request.json();
  const { data, status } = await hermesPost(`message/uncrypt/${id}`, body, cookie);
  return NextResponse.json(data, { status });
}
