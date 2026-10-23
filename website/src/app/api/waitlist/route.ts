import { NextResponse } from 'next/server';
import { fieldErrors, waitlistSchema } from '@/lib/forms';

/**
 * Waitlist sign-up. Validates, drops bot submissions, and stores the entry via the LinenTag API
 * (POST /waitlist on the server/ app). Newsletter tools can be connected there or here later.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Please check the highlighted fields.', errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { website, ...entry } = parsed.data;
  // Honeypot filled in: pretend success so bots don't retry.
  if (website) return NextResponse.json({ ok: true }, { status: 201 });

  const api = process.env.LINENTAG_API_URL;
  if (!api) {
    console.warn('[waitlist] LINENTAG_API_URL is not set; sign-up not stored:', entry.email);
    return NextResponse.json({ ok: true, stored: false }, { status: 201 });
  }

  try {
    const res = await fetch(`${api.replace(/\/$/, '')}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, company: entry.company || null }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
  } catch (err) {
    console.error('[waitlist] failed to store sign-up', err);
    return NextResponse.json({ message: 'We could not save your sign-up right now. Please try again shortly.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
