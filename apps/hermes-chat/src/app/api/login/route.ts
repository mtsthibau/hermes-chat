import { NextRequest, NextResponse } from 'next/server';
import { hermesPost } from '@hermes/api';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  const { data, status } = await hermesPost('login', { email: email.trim(), password });
  return NextResponse.json(data, { status });
}
