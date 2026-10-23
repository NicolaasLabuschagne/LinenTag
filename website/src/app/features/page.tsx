import { PageHeader } from '@/components/section';
import { FaqSection } from '@/components/sections/faq';
import { AudiencesSection, BenefitsSection, FeaturesSection, FinalCta, ProductDetailsSection } from '@/components/sections/home-sections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Features',
  description:
    'NFC sheet identification, bedding set matching, laundry tracking and linen inventory by room. Explore every LinenTag feature for homes, Airbnb hosts and hotels.',
  path: '/features',
});

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="Smart linen management, without the complexity"
        intro="Everything LinenTag does is designed around one idea: you should never have to unfold a sheet to know what it is."
      />
      <FeaturesSection />
      <ProductDetailsSection />
      <BenefitsSection />
      <AudiencesSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
