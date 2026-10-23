import { JsonLd } from '@/components/json-ld';
import { FaqSection } from '@/components/sections/faq';
import { Hero } from '@/components/sections/hero';
import {
  AudiencesSection,
  BenefitsSection,
  FeaturesSection,
  HowItWorksSection,
  ProblemSection,
  ProductDetailsSection,
  ShowcaseSection,
  TestimonialsSection,
} from '@/components/sections/home-sections';
import { WaitlistSection } from '@/components/sections/waitlist';
import { site } from '@/lib/site';

// Uses the default title/description from the root layout.

const product = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'LinenTag NFC Tags',
  brand: { '@type': 'Brand', name: site.name },
  description:
    'Washable NFC tags sewn into bed sheets, pillowcases and duvet covers. Tap with an iPhone or Android phone to identify the item, its set and its wash history.',
  category: 'Home organization',
  url: `${site.url}/nfc-tags`,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <FeaturesSection />
      <ProblemSection />
      <AudiencesSection />
      <ProductDetailsSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <BenefitsSection />
      <FaqSection />
      <WaitlistSection source="home" />
      <JsonLd data={product} />
    </>
  );
}
