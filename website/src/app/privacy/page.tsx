import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How LinenTag collects, uses and protects your information.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 22, 2026" intro="We collect as little as we can, and we never sell your data.">
      <h2>Who we are</h2>
      <p>
        LinenTag ("we", "us") provides washable NFC tags, the LinenTag app and this website. Questions about this policy can be sent to{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Information we collect</h2>
      <h3>When you join the waitlist or contact us</h3>
      <ul>
        <li>Your name, email address, and optionally your company.</li>
        <li>How you plan to use LinenTag (for example, home or hotel), and the contents of any message you send.</li>
      </ul>
      <h3>When you use the LinenTag app</h3>
      <ul>
        <li>Account details: your email address and, if you sign in with Google, your Google account ID and name. Passwords are stored only as secure hashes.</li>
        <li>The linen information you enter or scan: item details, sets, rooms, storage places, wash counts and scan history.</li>
        <li>The unique IDs of tags you register. Tags contain only an ID, never personal information.</li>
      </ul>
      <h3>On this website</h3>
      <ul>
        <li>Essential technical data needed to deliver pages securely, such as your IP address in server logs.</li>
        <li>With your consent only: privacy-friendly, aggregated usage analytics. See our <a href="/cookies">Cookie Policy</a>.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To provide the app and its features, and to keep your account secure.</li>
        <li>To contact you about early access, launches and pilot programs you signed up for.</li>
        <li>To answer your questions and support requests.</li>
        <li>To understand, in aggregate, how the website is used so we can improve it.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use it for third-party advertising.</p>

      <h2>Service providers</h2>
      <p>
        We use trusted providers to host our database and services, deliver email, and (with consent) measure website usage. They
        process data only on our instructions and under appropriate data-protection agreements.
      </p>

      <h2>Retention</h2>
      <p>
        We keep account data for as long as your account is active. Waitlist entries are kept until launch communications are complete
        or you ask us to remove them. You can delete your account and its data at any time.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export or delete your personal information, and to
        object to or restrict certain processing. To exercise these rights, email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit, passwords are hashed, and access to production systems is limited. No system is perfectly secure,
        but we work to protect your information and will notify you of any breach as required by law.
      </p>

      <h2>Children</h2>
      <p>LinenTag accounts are intended for adults. We do not knowingly collect information from children under 13.</p>

      <h2>Changes</h2>
      <p>If we make material changes to this policy, we will update the date above and, where appropriate, notify you.</p>
    </LegalPage>
  );
}
