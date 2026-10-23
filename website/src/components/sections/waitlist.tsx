'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/form';
import { track } from '@/lib/analytics';
import { fieldErrors, waitlistSchema } from '@/lib/forms';
import { USAGE_TYPES } from '@/lib/site';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

export function WaitlistSection({ source = 'home' }: { source?: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = waitlistSchema.safeParse({ ...values, source });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      // Move focus to the first invalid field.
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus({ kind: 'error', message: data.message ?? 'Something went wrong. Please try again.' });
        return;
      }
      track('Waitlist Signup', { usageType: parsed.data.usageType, source });
      setStatus({ kind: 'done' });
    } catch {
      setStatus({ kind: 'error', message: 'Could not reach the server. Check your connection and try again.' });
    }
  }

  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-brand-100 p-6 sm:p-12 lg:p-16">
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="eyebrow mb-3 !text-brand-700">Early access</p>
              <h2 id="waitlist-title" className="text-3xl font-medium sm:text-5xl">
                Join the waitlist
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink">
                Be first to get LinenTag tags and the app. Running a hotel, rental or laundry? Tell us, and we will reach out about
                pilot programs.
              </p>
              <ul className="mt-8 space-y-3 text-body">
                {['Early-access pricing on tag kits', 'Priority invitations to the app', 'No spam, unsubscribe any time'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <CheckCircle2 aria-hidden="true" className="size-5 text-brand-700" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div aria-live="polite">
              <AnimatePresence mode="wait">
                {status.kind === 'done' ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-line"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-12 text-accent-500" />
                    <h3 className="mt-4 text-2xl font-semibold">You're on the list</h3>
                    <p className="mt-2 text-body">Thanks! We'll email you as soon as early access opens.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={onSubmit}
                    noValidate
                    className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line sm:p-8"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="wl-name" label="Name" error={errors.name}>
                        {(p) => <Input {...p} name="name" autoComplete="name" required />}
                      </Field>
                      <Field id="wl-email" label="Email" error={errors.email}>
                        {(p) => <Input {...p} name="email" type="email" autoComplete="email" inputMode="email" required />}
                      </Field>
                    </div>
                    <Field id="wl-company" label="Company" optional error={errors.company}>
                      {(p) => <Input {...p} name="company" autoComplete="organization" />}
                    </Field>
                    <Field id="wl-usage" label="How will you use LinenTag?" error={errors.usageType}>
                      {(p) => (
                        <Select {...p} name="usageType" defaultValue="" required>
                          <option value="" disabled>
                            Choose one…
                          </option>
                          {USAGE_TYPES.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Field>
                    {/* Honeypot for bots; hidden from people and assistive tech. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                      <label htmlFor="wl-website">Website</label>
                      <input id="wl-website" name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    {status.kind === 'error' && (
                      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {status.message}
                      </p>
                    )}
                    <Button type="submit" size="lg" className="w-full" disabled={status.kind === 'sending'}>
                      {status.kind === 'sending' ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" /> Joining…
                        </>
                      ) : (
                        'Join the waitlist'
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted">
                      By joining you agree to our{' '}
                      <a href="/privacy" className="font-medium text-brand-700 underline underline-offset-4">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
