import type { ProductLabel } from './product';
import type {
  Dashboard,
  IntakeResult,
  Item,
  ItemFilters,
  ItemInput,
  LinenSet,
  LinenSetWithItems,
  MePatch,
  ScanResult,
  Session,
  SetInput,
  StorageLocation,
  User,
} from './types';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const TIMEOUT_MS = 8000;
/** The LinenTag website (label maker for bedding without tags). Served by the API server unless set. */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? API_URL).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
  get isNetwork() {
    return this.status === 0;
  }
}

let token: string | null = null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: { token: string | null; onUnauthorized?: () => void }) {
  token = opts.token;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', "Can't reach LinenTag. Check your connection.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.error?.code ?? 'HTTP', data.error?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => !!e[1]);
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export const api = {
  register: (email: string, password: string, name?: string) =>
    request<Session>('POST', '/auth/register', { email, password, name }),
  login: (email: string, password: string) => request<Session>('POST', '/auth/login', { email, password }),
  google: (idToken: string) => request<Session>('POST', '/auth/google', { idToken }),
  me: () => request<{ user: User }>('GET', '/auth/me'),
  updateMe: (patch: MePatch) => request<{ user: User }>('PATCH', '/auth/me', patch).then((r) => r.user),

  listLocations: () => request<{ locations: StorageLocation[] }>('GET', '/locations').then((r) => r.locations),
  createLocation: (name: string) =>
    request<{ location: StorageLocation }>('POST', '/locations', { name }).then((r) => r.location),
  renameLocation: (id: string, name: string) =>
    request<{ location: StorageLocation }>('PATCH', `/locations/${id}`, { name }).then((r) => r.location),
  deleteLocation: (id: string) => request<void>('DELETE', `/locations/${id}`),

  dashboard: () => request<Dashboard>('GET', '/dashboard'),
  intake: (body: {
    product: Omit<ProductLabel, 'tagUid'>;
    tagUid?: string | null;
    room?: string | null;
    locationId?: string | null;
    setId?: string | null;
    purchaseDate?: string | null;
  }) => request<IntakeResult>('POST', '/intake', body),
  lookupLabel: (label: Pick<ProductLabel, 'name' | 'packCode' | 'pieceNo'>) =>
    request<{ item: Item }>('POST', '/intake/lookup', label).then((r) => r.item),
  scan: (tagUid: string, wash = false) => request<ScanResult>('POST', '/scan', { tagUid, wash }),

  listItems: (filters: ItemFilters = {}) =>
    request<{ items: Item[] }>('GET', `/items${query(filters)}`).then((r) => r.items),
  getItem: (id: string) => request<{ item: Item }>('GET', `/items/${id}`).then((r) => r.item),
  createItem: (input: ItemInput) => request<{ item: Item }>('POST', '/items', input).then((r) => r.item),
  updateItem: (id: string, input: ItemInput) =>
    request<{ item: Item }>('PATCH', `/items/${id}`, input).then((r) => r.item),
  deleteItem: (id: string) => request<void>('DELETE', `/items/${id}`),
  linkTag: (id: string, tagUid: string) =>
    request<{ item: Item }>('PUT', `/items/${id}/tag`, { tagUid }).then((r) => r.item),
  unlinkTag: (id: string) => request<{ item: Item }>('DELETE', `/items/${id}/tag`).then((r) => r.item),

  listSets: () => request<{ sets: LinenSet[] }>('GET', '/sets').then((r) => r.sets),
  getSet: (id: string) => request<{ set: LinenSetWithItems }>('GET', `/sets/${id}`).then((r) => r.set),
  createSet: (input: SetInput) => request<{ set: LinenSetWithItems }>('POST', '/sets', input).then((r) => r.set),
  updateSet: (id: string, input: SetInput) =>
    request<{ set: LinenSetWithItems }>('PATCH', `/sets/${id}`, input).then((r) => r.set),
  deleteSet: (id: string) => request<void>('DELETE', `/sets/${id}`),
  /** Put a set on the bed; the room's previous set goes to the laundry. */
  useSet: (id: string) =>
    request<{ set: LinenSetWithItems; sentToLaundry: { id: string; name: string }[] }>('POST', `/sets/${id}/use`),
};
