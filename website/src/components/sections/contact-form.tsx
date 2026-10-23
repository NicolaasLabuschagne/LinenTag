'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { track } from '@/lib/analytics';
import { contactSchema, fieldErrors } from '@/lib/forms';

type Status = 'idle' | 'sending' | 'done' | { error: string };

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus({ error: data.message ?? 'Something went wrong. Please try again.' });
        return;
      }
      track('Contact Message', { topic: parsed.data.topic });
      setStatus('done');
    } catch {
      setStatus({ error: 'Could not reach the server. Check your connection and try again.' });
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-center rounded-2xl bg-white p-10 text-center ring-1 ring-line">
        <CheckCircle2 aria-hidden="true" className="size-12 text-accent-500" />
        <h2 className="mt-4 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-body">Thanks for getting in touch. We'll reply by email.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={errors.name}>
          {(p) => <Input {...p} name="name" autoComplete="name" />}
        </Field>
        <Field id="c-email" label="Email" error={errors.email}>
          {(p) => <Input {...p} name="email" type="email" autoComplete="email" />}
        </Field>
      </div>
      <Field id="c-topic" label="Topic" error={errors.topic}>
        {(p) => (
          <Select {...p} name="topic" defaultValue="general">
            <option value="general">General question</option>
            <option value="sales">Hotels, rentals & sales</option>
            <option value="partnership">Manufacturing partnership</option>
            <option value="press">Press</option>
            <option value="support">App support</option>
          </Select>
        )}
      </Field>
      <Field id="c-message" label="Message" error={errors.message}>
        {(p) => <Textarea {...p} name="message" rows={6} />}
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div aria-live="polite">
        {typeof status === 'object' && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {status.error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          'Send message'
        )}
      </Button>
    </form>
  );
}
