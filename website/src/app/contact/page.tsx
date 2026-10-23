import { Building2, Mail, Newspaper } from 'lucide-react';
import { PageHeader, Section } from '@/components/section';
import { ContactForm } from '@/components/sections/contact-form';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Get in touch with LinenTag about smart linen identification for your home, rental, hotel, care home or laundry.',
  path: '/contact',
});

const channels = [
  { icon: Mail, title: 'General', body: 'Questions about LinenTag, tags or the app.' },
  { icon: Building2, title: 'Hospitality & partnerships', body: 'Hotels, rentals, care homes, laundries and bedding manufacturers.' },
  { icon: Newspaper, title: 'Press', body: 'Interviews, images and company information.' },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's talk" intro="Whether you have one linen closet or a thousand rooms, we'd love to hear from you." />
      <Section labelledBy="contact-title">
        <h2 id="contact-title" className="sr-only">
          Send us a message
        </h2>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            {channels.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-body">{body}</p>
                </div>
              </div>
            ))}
            <p className="text-body">
              Prefer email?{' '}
              <a href={`mailto:${site.email}`} className="font-medium text-brand-700 underline underline-offset-4">
                {site.email}
              </a>
            </p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
