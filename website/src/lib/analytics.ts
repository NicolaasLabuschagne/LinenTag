/**
 * Analytics events. A no-op until an analytics script is loaded (only after cookie consent).
 * Plausible exposes window.plausible; other providers can be added here.
 */
type Plausible = (event: string, options?: { props?: Record<string, string> }) => void;

export function track(event: string, props?: Record<string, string>) {
  if (typeof window === 'undefined') return;
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
