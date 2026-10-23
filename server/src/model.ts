import { z } from 'zod';

export const ITEM_TYPES = [
  'fitted_sheet',
  'flat_sheet',
  'duvet_cover',
  'pillowcase',
  'comforter',
  'blanket',
  'mattress_protector',
  'other',
] as const;
export const SIZES = ['twin', 'twin_xl', 'full', 'queen', 'king', 'cal_king', 'standard', 'other'] as const;
export const STATUSES = ['active', 'in_laundry', 'retired'] as const;
export const SET_STATUSES = ['stored', 'in_use', 'laundry'] as const;
export const SET_COLORS =['blue', 'green', 'yellow', 'orange', 'red', 'purple', 'pink', 'grey'] as const;

/** Answers from first-run setup. Defaults apply to keys a user hasn't set. */
export const userSettings = z.object({
  multipleLocations: z.boolean().default(false),
  trackWashes: z.boolean().default(true),
});
export type UserSettings = z.infer<typeof userSettings>;
/** For updates: no defaults, so omitted keys keep their stored value. */
export const userSettingsPatch = z
  .object({ multipleLocations: z.boolean(), trackWashes: z.boolean() })
  .partial()
  .strict();

export function toUser(r: any) {
  return {
    id: r.id as string,
    email: r.email as string,
    name: r.name as string | null,
    onboarded: r.onboarded_at != null,
    settings: userSettings.parse(r.settings ?? {}),
  };
}

/** Tag UIDs arrive as "04:A2:..." or "04a2..." depending on platform; store bare uppercase hex. */
export const tagUid = z
  .string()
  .transform((s) => s.replace(/[^0-9a-f]/gi, '').toUpperCase())
  .pipe(z.string().min(8, 'Tag UID too short').max(64));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((s) => (s ? s : null));

export const itemInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(ITEM_TYPES),
  size: z.enum(SIZES).nullish(),
  material: optionalText(80),
  color: optionalText(40),
  room: optionalText(80),
  notes: optionalText(2000),
  status: z.enum(STATUSES).optional(),
  purchaseDate: z.iso.date().nullish(),
  setId: z.uuid().nullish(),
  tagUid: tagUid.nullish(),
});
export type ItemInput = z.infer<typeof itemInput>;

/** camelCase API field -> column. Doubles as the whitelist for writes. */
export const ITEM_COLUMNS = {
  name: 'name',
  type: 'type',
  size: 'size',
  material: 'material',
  color: 'color',
  room: 'room',
  notes: 'notes',
  status: 'status',
  purchaseDate: 'purchase_date',
  setId: 'set_id',
  tagUid: 'tag_uid',
} as const satisfies Record<keyof ItemInput, string>;

const dateOnly = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : (v as string | null));
const timestamp = (v: unknown) => (v == null ? null : new Date(v as string).toISOString());

export function toItem(r: any) {
  return {
    id: r.id as string,
    tagUid: r.tag_uid as string | null,
    name: r.name as string,
    type: r.type as string,
    size: r.size as string | null,
    material: r.material as string | null,
    color: r.color as string | null,
    room: r.room as string | null,
    notes: r.notes as string | null,
    status: r.status as string,
    purchaseDate: dateOnly(r.purchase_date),
    setId: r.set_id as string | null,
    washCount: Number(r.wash_count),
    lastWashedAt: timestamp(r.last_washed_at),
    createdAt: timestamp(r.created_at)!,
    updatedAt: timestamp(r.updated_at)!,
  };
}

export function toSet(r: any) {
  return {
    id: r.id as string,
    name: r.name as string,
    room: r.room as string | null,
    notes: r.notes as string | null,
    color: r.color as string | null,
    status: (r.status ?? 'stored') as (typeof SET_STATUSES)[number],
    statusChangedAt: timestamp(r.status_changed_at),
    locationId: r.location_id as string | null,
    locationName: (r.location_name ?? null) as string | null,
    /** Pieces the retail pack contained, when the set came from product labels. */
    expectedPieces: r.expected_pieces == null ? null : Number(r.expected_pieces),
    itemCount: r.item_count == null ? undefined : Number(r.item_count),
    createdAt: timestamp(r.created_at)!,
  };
}

export function toLocation(r: any) {
  return { id: r.id as string, name: r.name as string };
}
