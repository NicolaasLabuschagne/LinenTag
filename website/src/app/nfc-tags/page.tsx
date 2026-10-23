import { Printer, Scissors, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/motion';
import { PageHeader, Section, SectionHeading } from '@/components/section';
import { FaqSection } from '@/components/sections/faq';
import { ProductDetailsSection } from '@/components/sections/home-sections';
import { WaitlistSection } from '@/components/sections/waitlist';
import { Button } from '@/components/ui/button';
import { HoverCard, IconBadge } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'NFC Tags for Bedding',
  description:
    'Sew-in, washable NFC tags that turn the sheets, pillowcases and duvet covers you already own into LinenTag bedding. Works with iPhone and Android.',
  path: '/nfc-tags',
});

/** Set when the tag kit goes on sale; until then the page points to the waitlist. */
const SHOP_URL = '';

const upgrade = [
  { icon: Scissors, title: 'Sew in a tag', body: 'Stitch one tag into a seam or hem of each piece. Fitted sheet corners, flat sheet hems and pillowcase flaps work well.' },
  { icon: ScanLine, title: 'Tap to register', body: 'In the app, tap Add new bedding or open an item and tap Link a tag. Already using printed labels? Use Upgrade my bedding.' },
  { icon: Printer, title: 'Not ready yet?', body: 'Print free labels for your bedding today and upgrade to sewn-in tags later. Nothing needs to be redone.' },
];

export default function NfcTagsPage() {
  return (
    <>
      <PageHeader
        eyebrow="LinenTag tags"
        title="Make the bedding you already own smart"
        intro="Small, washable NFC tags that sew into any sheet, pillowcase or duvet cover. Tap with your phone and know exactly what it is."
      />
      <div className="container-page flex flex-col justify-center gap-3 pt-10 sm:flex-row">
        <Button asChild size="lg">
          {SHOP_URL ? <a href={SHOP_URL}>Buy NFC tags</a> : <Link href="#waitlist">Get early access to tag kits</Link>}
        </Button>
        <Button asChild size="lg" variant="secondary">
          <a href="/labels">Print free labels instead</a>
        </Button>
      </div>
      <ProductDetailsSection />
      <Section labelledBy="upgrade-title" className="bg-white">
        <SectionHeading id="upgrade-title" eyebrow="Getting started" title="Tag your existing bedding in minutes" />
        <div className="grid gap-5 md:grid-cols-3">
          {upgrade.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <HoverCard className="h-full">
                <IconBadge tone="accent">
                  <Icon />
                </IconBadge>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-body">{body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </Section>
      <FaqSection />
      <WaitlistSection source="nfc-tags" />
    </>
  );
}
