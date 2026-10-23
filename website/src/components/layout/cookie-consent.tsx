'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type Consent = 'accepted' | 'declined';
const STORAGE_KEY = 'linentag-cookie-consent';

const ConsentContext = createContext<{ consent: Consent | null; reopen: () => void } | null>(null);

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Cookie consent. Only strictly necessary storage is used until the visitor accepts;
 * analytics load after "Accept".
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setVisible(stored === null);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private mode: the choice lasts for this page view.
    }
    setConsent(value);
    setVisible(false);
  };

  const reopen = useCallback(() => setVisible(true), []);

  return (
    <ConsentContext.Provider value={{ consent, reopen }}>
      {children}
      <Analytics enabled={consent === 'accepted'} />
      <AnimatePresence>
        {visible && (
          <motion.div
            role="dialog"
            aria-live="polite"
            aria-label="Cookie preferences"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-white/95 p-5 shadow-2xl backdrop-blur sm:inset-x-6"
          >
            <p className="text-[0.95rem] text-body">
              We use essential cookies to run this site and, with your permission, privacy-friendly analytics to understand how
              it's used. <Link href="/cookies" className="font-medium text-brand-700 underline underline-offset-4">Cookie Policy</Link>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => choose('accepted')}>
                Accept analytics
              </Button>
              <Button size="sm" variant="secondary" onClick={() => choose('declined')}>
                Essential only
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConsentContext.Provider>
  );
}

/** Analytics script, only after consent. Plausible is cookie-free; swap in another provider here if needed. */
function Analytics({ enabled }: { enabled: boolean }) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!enabled || !domain) return null;
  return <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />;
}

export function CookieSettingsLink() {
  const ctx = useContext(ConsentContext);
  return (
    <button type="button" onClick={ctx?.reopen} className="hover:text-brand-700">
      Cookie settings
    </button>
  );
}
