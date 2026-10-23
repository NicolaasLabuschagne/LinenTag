import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cookie Policy',
  description: 'Which cookies and similar technologies the LinenTag website uses, and how to control them.',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="October 22, 2026" intro="Short version: essential storage only, unless you say yes to analytics.">
      <h2>What we use</h2>
      <h3>Essential</h3>
      <p>
        We store your cookie choice in your browser's local storage (<code>linentag-cookie-consent</code>) so we don't ask again on every
        page. This is necessary for the site to respect your preference and does not track you.
      </p>
      <h3>Analytics (only with your consent)</h3>
      <p>
        If you choose "Accept analytics", we load a privacy-friendly analytics tool that measures page views and form sign-ups in
        aggregate. It does not use advertising cookies or build profiles of individual visitors. If you choose "Essential only", it is
        never loaded.
      </p>
      <h3>Advertising</h3>
      <p>We do not use advertising or cross-site tracking cookies.</p>

      <h2>Changing your choice</h2>
      <p>Use the "Cookie settings" link at the bottom of any page to change your choice at any time. You can also clear site data in your browser settings.</p>
    </LegalPage>
  );
}
