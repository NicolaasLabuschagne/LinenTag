import { CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { PageHeader, Section, SectionHeading } from '@/components/section';
import { FinalCta, HowItWorksSection, ShowcaseSection } from '@/components/sections/home-sections';
import { Card } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'How It Works',
  description:
    'Attach a washable NFC tag, tap it with your phone, and instantly see the size, set and history of any sheet. Here is how LinenTag works at home and in hospitality.',
  path: '/how-it-works',
});

const moments = [
  {
    title: 'Getting started',
    points: [
      'New LinenTag bedding: scan the label on each piece and the details fill themselves in.',
      'Bedding you already own: sew in a LinenTag NFC tag, or print a free label to start today.',
      'Choose the room each set belongs to, and where it is stored if you have more than one closet.',
    ],
  },
  {
    title: 'Making a bed',
    points: [
      'Tap Use on the set going onto the bed. The set coming off moves to the laundry automatically.',
      'Not sure which sheet you are holding? Tap it with your phone and see exactly what it is.',
    ],
  },
  {
    title: 'After the laundry',
    points: [
      'Open Put away laundry and tap each piece as you fold it, with no button presses in between.',
      'Watch each set come together, see what is missing, and get told where the finished set goes.',
      'Wash counts are recorded automatically, so you know when bedding is wearing out.',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader eyebrow="How it works" title="Tap. Know. Done." intro="LinenTag fits into the two moments that matter: making a bed, and putting laundry away." />
      <HowItWorksSection />
      <Section labelledBy="moments-title" className="bg-white">
        <SectionHeading id="moments-title" title="LinenTag in everyday life" />
        <div className="grid gap-5 lg:grid-cols-3">
          {moments.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.08}>
              <Card className="h-full">
                <h3 className="text-xl font-semibold">{m.title}</h3>
                <ul className="mt-4 space-y-3">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-3 text-body">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent-700" /> {p}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <ShowcaseSection />
      <FinalCta />
    </>
  );
}
