import { NextRequest, NextResponse } from 'next/server';
import { hermesPostMultipart } from '@hermes/api';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const orig = (formData.get('orig') as string | null) ?? 'chat';
  const dest = (formData.get('dest[]') as string | null) ?? (formData.get('dest') as string | null);
  const name = (formData.get('name') as string | null) ?? file?.name ?? '';

  if (!file || !dest) {
    return NextResponse.json({ message: 'Missing file or destination.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimetype = file.type || 'application/octet-stream';

  const fields: Array<[string, string]> = [
    ['orig', orig],
    ['dest[]', dest],
    ['name', name],
    ['mimetype', mimetype],
  ];

  const { data, status } = await hermesPostMultipart('message', fields, {
    fieldName: 'file',
    filename: file.name,
    mimetype,
    buffer,
  });

  return NextResponse.json(data, { status });
}
