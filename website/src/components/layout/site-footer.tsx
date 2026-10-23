import Link from 'next/link';
import { Logo } from '@/components/logo';
import { footerNav, site } from '@/lib/site';
import { CookieSettingsLink } from './cookie-consent';

function SocialIcon({ name }: { name: 'instagram' | 'linkedin' | 'x' }) {
  const paths = {
    instagram:
      'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.1-9.4a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3Z',
    linkedin:
      'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z',
    x: 'M17.7 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.3L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.8L17.7 3Zm-1.1 16.2h1.7L7.5 4.7H5.7l10.9 14.5Z',
  } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d={paths[name]} />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link href="/" aria-label="LinenTag home">
              <Logo />
            </Link>
            <p className="mt-4 text-muted">{site.tagline}</p>
            <div className="mt-6 flex gap-2">
              {(['instagram', 'linkedin', 'x'] as const).map((name) => (
                <a
                  key={name}
                  href={site.social[name]}
                  aria-label={`LinenTag on ${name === 'x' ? 'X' : name[0].toUpperCase() + name.slice(1)}`}
                  className="inline-flex size-10 items-center justify-center rounded-full text-muted ring-1 ring-line transition hover:text-brand-700 hover:ring-brand-200"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerNav).map(([heading, links]) => (
            <nav key={heading} aria-label={heading}>
              <h2 className="text-sm font-semibold text-ink">{heading}</h2>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-muted transition-colors hover:text-brand-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LinenTag. All rights reserved.</p>
          <div className="flex gap-6">
            <a href={`mailto:${site.email}`} className="hover:text-brand-700">
              {site.email}
            </a>
            <CookieSettingsLink />
          </div>
        </div>
      </div>
    </footer>
  );
}
