import { NextRequest, NextResponse } from 'next/server';
import { hermesGetBuffer } from '@hermes/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileid: string }> },
) {
  const { fileid } = await params;
  const cookie = _req.headers.get('cookie') ?? undefined;
  const pass = _req.nextUrl.searchParams.get('pass');
  const ufilePath = pass ? `ufile/${fileid}?pass=${encodeURIComponent(pass)}` : `ufile/${fileid}`;
  let { buffer, status, contentType } = await hermesGetBuffer(ufilePath, cookie);

  // Some Hermes setups expose files on `file/:id` while others use `ufile/:id`.
  if (status === 404) {
    const filePath = pass ? `file/${fileid}?pass=${encodeURIComponent(pass)}` : `file/${fileid}`;
    ({ buffer, status, contentType } = await hermesGetBuffer(filePath, cookie));
  }

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    status,
    headers: { 'Content-Type': contentType },
  });
}
