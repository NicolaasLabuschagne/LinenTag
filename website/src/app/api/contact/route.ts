import { NextResponse } from 'next/server';
import { contactSchema, fieldErrors } from '@/lib/forms';

/** Contact form. Forwards to CONTACT_WEBHOOK_URL (e.g. Slack, Zapier, Make) when configured. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Please check the highlighted fields.', errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { website, ...message } = parsed.data;
  if (website) return NextResponse.json({ ok: true });

  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) {
    console.warn('[contact] CONTACT_WEBHOOK_URL is not set; message from', message.email, 'not delivered');
    return NextResponse.json({ ok: true, delivered: false });
  }
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...message, text: `New ${message.topic} message from ${message.name} <${message.email}>:\n\n${message.message}` }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error('[contact] failed to deliver message', err);
    return NextResponse.json({ message: 'We could not send your message right now. Please email us instead.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
