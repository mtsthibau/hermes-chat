import { NextRequest, NextResponse } from 'next/server';
import { hermesGetBuffer } from '@/lib/hermesApi';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileid: string }> },
) {
  const { fileid } = await params;
  const cookie = _req.headers.get('cookie') ?? undefined;
  const { buffer, status, contentType } = await hermesGetBuffer(`ufile/${fileid}`, cookie);
  return new NextResponse(buffer.buffer as ArrayBuffer, {
    status,
    headers: { 'Content-Type': contentType },
  });
}
