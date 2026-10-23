import { router } from 'expo-router';
import { ApiError, api } from './api';
import { normalizeUid } from './labels';
import { parseProductLabel } from './product';
import type { Item } from './types';

/**
 * QR codes as stand-in tags, for testing without NFC hardware.
 * Set to false (or delete this file and its call sites) once real LinenTags exist.
 */
export const QR_TEST_TAGS = true;

/** 32-bit FNV-1a, as 8 hex chars. */
function fnv1a(text: string, seed: number): string {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Map QR content to a tag UID. Hex content (e.g. "04:A2:3B:4C") is used as-is so a QR can
 * mimic a specific NFC tag; anything else hashes to a stable 16-char hex ID.
 */
export function qrToUid(data: string): string {
  const text = data.trim();
  const hex = normalizeUid(text);
  if (/^[0-9a-f:\-\s]+$/i.test(text) && hex.length >= 8 && hex.length <= 64) return hex;
  return (fnv1a(text, 0x811c9dc5) + fnv1a(text, 0x050c5d1f)).toUpperCase();
}

/** A scanned label belongs to an item that has no tag linked; carries the item so it can still be shown. */
export class UntaggedItemError extends Error {
  constructor(public item: Item) {
    super(`${item.name} doesn't have a tag yet. Open it and tap "Link a tag".`);
  }
}

/**
 * The tag UID a scanned QR stands for. A product label isn't a tag itself, but it identifies
 * an item: the item it was registered as (whatever tag that item has now), or failing that,
 * the tag ID printed on the label.
 * Throws UntaggedItemError for a known item without a tag, or a user-facing Error otherwise.
 */
export async function qrToTagUid(data: string): Promise<string> {
  const label = parseProductLabel(data);
  if (!label) return qrToUid(data);
  if (label.packCode) {
    try {
      const item = await api.lookupLabel(label);
      if (item.tagUid) return item.tagUid;
      throw new UntaggedItemError(item);
    } catch (err) {
      if (!(err instanceof ApiError && err.code === 'LABEL_NOT_REGISTERED')) throw err;
    }
  }
  if (label.tagUid) return label.tagUid;
  throw new Error(`This ${label.name} label hasn't been added yet. Use "Add new bedding" to add it.`);
}

// The scanner is a separate screen, so hand its result back to whoever opened it.
let pending: ((uid: string | null | Promise<string>) => void) | null = null;

/**
 * Open the QR scanner screen; resolves with a tag UID, or null if the user backs out.
 * Rejects with a user-facing message if a scanned label can't be matched to a tag.
 */
export function scanQr(): Promise<string | null> {
  pending?.(null);
  return new Promise((resolve) => {
    pending = resolve;
    router.push('/qr-scan');
  });
}

/** Called by the scanner screen. Only the first call per scan counts. */
export function finishQrScan(data: string | null) {
  const resolve = pending;
  pending = null;
  resolve?.(data === null ? null : qrToTagUid(data));
}
