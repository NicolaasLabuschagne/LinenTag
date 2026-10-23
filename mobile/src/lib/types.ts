export type ItemType =
  | 'fitted_sheet'
  | 'flat_sheet'
  | 'duvet_cover'
  | 'pillowcase'
  | 'comforter'
  | 'blanket'
  | 'mattress_protector'
  | 'other';
export type Size = 'twin' | 'twin_xl' | 'full' | 'queen' | 'king' | 'cal_king' | 'standard' | 'other';
export type Status = 'active' | 'in_laundry' | 'retired';

/** Where a set is in the laundry cycle: put away, on the bed, or in the wash. */
export type SetStatus = 'stored' | 'in_use' | 'laundry';
export type SetColor ='blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'pink' | 'grey';

/** Answers from first-run setup; they decide which features the app shows. */
export type UserSettings = { multipleLocations: boolean; trackWashes: boolean };
export type User = { id: string; email: string; name: string | null; onboarded: boolean; settings: UserSettings };
export type MePatch = { name?: string | null; settings?: Partial<UserSettings>; onboarded?: true };

export type StorageLocation = { id: string; name: string };
export type Session = { token: string; user: User };

export type Item = {
  id: string;
  tagUid: string | null;
  name: string;
  type: ItemType;
  size: Size | null;
  material: string | null;
  color: string | null;
  room: string | null;
  notes: string | null;
  status: Status;
  purchaseDate: string | null;
  setId: string | null;
  washCount: number;
  lastWashedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemInput = Partial<
  Pick<Item, 'name' | 'type' | 'size' | 'material' | 'color' | 'room' | 'notes' | 'status' | 'purchaseDate' | 'setId' | 'tagUid'>
>;

export type LinenSet = {
  id: string;
  name: string;
  room: string | null;
  notes: string | null;
  color: SetColor | null;
  status: SetStatus;
  statusChangedAt: string | null;
  locationId: string | null;
  locationName: string | null;
  expectedPieces: number | null;
  itemCount?: number;
  createdAt: string;
};
export type LinenSetWithItems = LinenSet & { items: Item[] };
export type SetInput = {
  name?: string;
  room?: string | null;
  notes?: string | null;
  color?: SetColor;
  status?: SetStatus;
  locationId?: string | null;
  itemIds?: string[];
};

export type ScanResult = { item: Item; set: LinenSetWithItems | null };
export type IntakeResult = ScanResult & { itemCreated: boolean; setCreated: boolean };

export type Dashboard = {
  totalItems: number;
  totalSets: number;
  /** Items identified by home-made printed labels, which could be upgraded to NFC tags. */
  printedLabelItems: number;
  recentlyScanned: { scannedAt: string; item: Item }[];
};

export type ItemFilters = {
  size?: Size;
  type?: ItemType;
  status?: Status;
  room?: string;
  material?: string;
  setId?: string;
  q?: string;
};
