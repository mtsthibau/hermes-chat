import { NextRequest, NextResponse } from 'next/server';
import { hermesGet } from '@/lib/hermesApi';

const ALLOWED_TYPES = new Set(['inbox', 'sent', 'draft']);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ message: 'Invalid message type.' }, { status: 400 });
  }
  const cookie = _req.headers.get('cookie') ?? undefined;
  const { data, status } = await hermesGet(`message/type/${type}`, cookie);
  return NextResponse.json(data, { status });
}
