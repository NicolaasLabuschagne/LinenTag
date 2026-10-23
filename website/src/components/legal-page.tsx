import type { ReactNode } from 'react';
import { PageHeader } from './section';

/** Shared layout for policy pages. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: string; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} intro={intro} />
      <div className="container-page py-16">
        <div className="prose-page mx-auto">
          <p className="text-sm text-muted">Last updated: {updated}</p>
          {/* Remove once reviewed by counsel for the jurisdictions LinenTag operates in. */}
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This policy is a working draft and will be finalized before LinenTag launches.
          </p>
          {children}
        </div>
      </div>
    </>
  );
}
