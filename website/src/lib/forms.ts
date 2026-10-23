import { z } from 'zod';
import { USAGE_TYPES } from './site';

const usageValues = USAGE_TYPES.map((u) => u.value) as [string, ...string[]];

/** Shared by the waitlist form (client-side validation) and its API route (server-side). */
export const waitlistSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100, 'That name is too long'),
  email: z.email('Please enter a valid email address').max(200),
  company: z.string().trim().max(120, 'That company name is too long').optional().or(z.literal('')),
  usageType: z.enum(usageValues, { error: 'Please choose how you would use LinenTag' }),
  source: z.string().max(60).optional(),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(0).optional().or(z.literal('')),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  email: z.email('Please enter a valid email address').max(200),
  topic: z.enum(['general', 'sales', 'partnership', 'press', 'support']),
  message: z.string().trim().min(10, 'Please write a little more (10 characters or more)').max(4000),
  website: z.string().max(0).optional().or(z.literal('')),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** First error message per field, for showing under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}
