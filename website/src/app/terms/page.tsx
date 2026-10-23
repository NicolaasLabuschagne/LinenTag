import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'The terms that apply when you use the LinenTag website, app and tags.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 22, 2026" intro="The rules for using LinenTag, in plain language where we can.">
      <h2>1. Agreement</h2>
      <p>By using the LinenTag website, app or tags ("the Service"), you agree to these terms. If you use LinenTag for a business, you confirm you can accept them on its behalf.</p>

      <h2>2. Your account</h2>
      <p>You are responsible for keeping your login details secure and for activity under your account. Tell us promptly at <a href={`mailto:${site.email}`}>{site.email}</a> if you suspect unauthorized access.</p>

      <h2>3. Your content</h2>
      <p>The linen information you add stays yours. You give us permission to store and process it only to provide the Service to you.</p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>Do not misuse the Service, attempt to access other users' data, or interfere with its operation.</li>
        <li>Do not use the Service for anything unlawful.</li>
      </ul>

      <h2>5. Tags and physical products</h2>
      <p>
        Follow the care and attachment instructions provided with LinenTag tags. Tags are small parts: keep them away from young children
        and pets before they are sewn in. Tag performance can vary with fabric, placement, phone model and laundry conditions.
      </p>

      <h2>6. Early access</h2>
      <p>Features offered before general launch may change, be limited, or be withdrawn. Early-access pricing, where offered, will be stated at the time of purchase.</p>

      <h2>7. Disclaimers</h2>
      <p>The Service is provided "as is". To the extent permitted by law, we disclaim implied warranties, and we do not guarantee that the Service will be uninterrupted or error-free.</p>

      <h2>8. Limitation of liability</h2>
      <p>To the extent permitted by law, LinenTag is not liable for indirect or consequential losses, and our total liability is limited to the amount you paid us in the twelve months before the claim.</p>

      <h2>9. Ending use</h2>
      <p>You can stop using the Service and delete your account at any time. We may suspend accounts that breach these terms.</p>

      <h2>10. Changes and contact</h2>
      <p>We may update these terms; the date above shows the latest version. Questions: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}
