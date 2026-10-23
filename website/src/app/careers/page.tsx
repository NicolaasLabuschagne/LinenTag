import { ArrowUpRight, Globe, Rocket, Users } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { PageHeader, Section, SectionHeading } from '@/components/section';
import { Card, HoverCard, IconBadge } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Careers',
  description: 'Help build smart linen identification. See open roles at LinenTag and how we work.',
  path: '/careers',
});

const perks = [
  { icon: Rocket, title: 'Early and impactful', body: 'Join at the start and shape the product, the brand and how we work.' },
  { icon: Globe, title: 'Remote-friendly', body: 'We care about great work, not where it happens.' },
  { icon: Users, title: 'Close to customers', body: 'Everyone talks to families, hosts and housekeeping teams. It is the fastest way to build the right thing.' },
];

// Example openings: edit this list as hiring plans firm up.
const roles = [
  { title: 'Founding Mobile Engineer (React Native)', team: 'Engineering', location: 'Remote' },
  { title: 'Hardware & Textile Integration Lead', team: 'Product', location: 'Hybrid' },
  { title: 'Hospitality Partnerships Manager', team: 'Sales', location: 'Remote' },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader eyebrow="Careers" title="Build the future of smart bedding" intro="We're a small team turning everyday linen into something that identifies itself. Come help." />
      <Section labelledBy="why-title">
        <SectionHeading id="why-title" title="Why LinenTag" />
        <div className="grid gap-5 md:grid-cols-3">
          {perks.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <HoverCard className="h-full">
                <IconBadge>
                  <Icon />
                </IconBadge>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-body">{body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section labelledBy="roles-title" className="bg-white">
        <SectionHeading id="roles-title" title="Open roles" />
        <div className="mx-auto max-w-3xl space-y-3">
          {roles.map((role) => (
            <a
              key={role.title}
              href={`mailto:${site.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-md"
            >
              <div>
                <h3 className="font-semibold text-ink group-hover:text-brand-700">{role.title}</h3>
                <p className="text-sm text-muted">
                  {role.team} · {role.location}
                </p>
              </div>
              <ArrowUpRight aria-hidden="true" className="size-5 text-muted transition group-hover:text-brand-700" />
            </a>
          ))}
          <Card className="mt-6 bg-brand-50/60 text-center">
            <p className="text-body">
              Don't see your role? Email{' '}
              <a href={`mailto:${site.email}`} className="font-medium text-brand-700 underline underline-offset-4">
                {site.email}
              </a>{' '}
              and tell us how you'd help.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
