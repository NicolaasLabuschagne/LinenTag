import { normalizeUid, SIZE_LABELS, TYPE_LABELS } from './labels';
import type { ItemType, Size } from './types';

/**
 * Product label printed on bedding packaging (format v1). A URL so a label scanned by a normal
 * camera app could later open a product page; LinenTag reads the query parameters:
 *
 *   https://linentag.app/p?lt=1&n=Fitted%20Sheet&t=fitted_sheet&s=king&m=100%25%20Cotton&c=White
 *     &pk=CWK-000123&sn=Classic%20White%20King&pc=5&i=1&u=04A23B4C5D6E7F
 *
 *   lt  format version (required, "1")     n  item name (required)    t  item type (required)
 *   s   size        m  material   c  colour
 *   pk  pack code: unique per retail pack; every piece in the pack shares it, so they form one set
 *   sn  set name    pc  pieces in the pack    i  this piece's number in the pack
 *   u   NFC tag UID, when the manufacturer sewed the tag in and knows it (skips the tag-tap step)
 */
export type ProductLabel = {
  name: string;
  type: ItemType;
  size: Size | null;
  material: string | null;
  color: string | null;
  packCode: string | null;
  setName: string | null;
  pieceCount: number | null;
  pieceNo: number | null;
  tagUid: string | null;
};

function parseQuery(text: string): Map<string, string> {
  const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : text;
  const params = new Map<string, string>();
  for (const pair of query.split('#')[0].split('&')) {
    const eq = pair.indexOf('=');
    if (eq <= 0) continue;
    try {
      params.set(pair.slice(0, eq), decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' ')).trim());
    } catch {
      // Malformed escape: ignore this parameter.
    }
  }
  return params;
}

const positiveInt = (v: string | undefined) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n <= 50 ? n : null;
};

/** Returns null for anything that isn't a LinenTag product label (e.g. a QR test tag). */
export function parseProductLabel(data: string): ProductLabel | null {
  const p = parseQuery(data.trim());
  if (p.get('lt') !== '1') return null;
  const name = p.get('n');
  const type = p.get('t') as ItemType | undefined;
  if (!name || !type || !(type in TYPE_LABELS)) return null;
  const size = p.get('s') as Size | undefined;
  const uid = p.get('u') ? normalizeUid(p.get('u')!) : '';
  return {
    name: name.slice(0, 120),
    type,
    size: size && size in SIZE_LABELS ? size : null,
    material: p.get('m') || null,
    color: p.get('c') || null,
    packCode: p.get('pk') || null,
    setName: p.get('sn') || null,
    pieceCount: positiveInt(p.get('pc')),
    pieceNo: positiveInt(p.get('i')),
    tagUid: uid.length >= 8 ? uid : null,
  };
}
