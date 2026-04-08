import { NextRequest, NextResponse } from "next/server";
import { hermesGetBuffer } from "@/lib/hermesApi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileid: string }> },
) {
  const { fileid } = await params;
  const cookie = req.headers.get("cookie") ?? undefined;
  const pass = req.nextUrl.searchParams.get("pass");
  const ufilePath = pass ? `ufile/${fileid}?pass=${encodeURIComponent(pass)}` : `ufile/${fileid}`;
  let { buffer, status, contentType } = await hermesGetBuffer(ufilePath, cookie);

  // Keep compatibility with Hermes instances that serve downloads via `file/:id`.
  if (status === 404) {
    const filePath = pass ? `file/${fileid}?pass=${encodeURIComponent(pass)}` : `file/${fileid}`;
    ({ buffer, status, contentType } = await hermesGetBuffer(filePath, cookie));
  }

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    status,
    headers: { "Content-Type": contentType },
  });
}
