import type { ItemType, LinenSet, SetColor, SetStatus, Size, Status } from './types';

export const SET_COLORS: Record<SetColor, { label: string; hex: string }> = {
  blue: { label: 'Blue', hex: '#3B74C4' },
  green: { label: 'Green', hex: '#3E9A5B' },
  yellow: { label: 'Yellow', hex: '#E0B323' },
  orange: { label: 'Orange', hex: '#E07B2E' },
  red: { label: 'Red', hex: '#C9443A' },
  purple: { label: 'Purple', hex: '#7B57B8' },
  pink: { label: 'Pink', hex: '#D9659D' },
  grey: { label: 'Grey', hex: '#8A8F8C' },
};

export const TYPE_LABELS: Record<ItemType, string> = {
  fitted_sheet: 'Fitted Sheet',
  flat_sheet: 'Flat Sheet',
  duvet_cover: 'Duvet Cover',
  pillowcase: 'Pillowcase',
  comforter: 'Comforter',
  blanket: 'Blanket',
  mattress_protector: 'Mattress Protector',
  other: 'Other',
};

export const SIZE_LABELS: Record<Size, string> = {
  twin: 'Twin',
  twin_xl: 'Twin XL',
  full: 'Full',
  queen: 'Queen',
  king: 'King',
  cal_king: 'Cal King',
  standard: 'Standard',
  other: 'Other',
};

/** Item status. Where an item physically is (bed, laundry, closet) is its set's status. */
export const STATUS_LABELS: Record<Status, string> = {
  active: 'Active',
  in_laundry: 'In laundry',
  retired: 'Retired',
};

/** "In use", "In laundry", or where it's put away ("In Hall closet" when places are on). */
export function setStatusLabel(set: Pick<LinenSet, 'status' | 'locationName'>, showPlaces: boolean): string {
  // A missing status (set cached by an older app version) falls through to "put away".
  if (set.status === 'in_use') return 'In use';
  if (set.status === 'laundry') return 'In laundry';
  return showPlaces && set.locationName ? `In ${set.locationName}` : 'Put away';
}

export const SET_STATUS_COLORS: Record<SetStatus, { bg: string; fg: string }> = {
  in_use: { bg: '#D9E7DD', fg: '#3F5246' },
  laundry: { bg: '#F6EEDD', fg: '#6B5320' },
  stored: { bg: '#EFEBE3', fg: '#4B5563' },
};

export const options =<K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  // Date-only strings are parsed as UTC; render them without timezone drift.
  const date = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Today's date on this phone, as YYYY-MM-DD (not UTC, which can be a day off in the evening). */
export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : formatDate(iso);
}

/** Same normalisation the API applies, so cache keys match server UIDs. */
export const normalizeUid = (uid: string) => uid.replace(/[^0-9a-f]/gi, '').toUpperCase();
