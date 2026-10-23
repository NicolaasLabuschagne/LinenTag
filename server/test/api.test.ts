import { PGlite } from '@electric-sql/pglite';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { GoogleIdentity } from '../src/auth.js';
import type { Db } from '../src/db.js';
import { migrate } from '../src/migrate.js';

const googleTokens: Record<string, GoogleIdentity> = {
  'good-token': { sub: 'g-123', email: 'Host@Example.com', emailVerified: true, name: 'Host' },
};

let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  const pglite = new PGlite();
  const db: Db = { query: (text, params) => pglite.query(text, params), exec: (sql) => pglite.exec(sql) };
  await migrate(db);
  await migrate(db); // idempotent
  app = createApp({
    db,
    jwtSecret: 'test-secret',
    verifyGoogleToken: async (t) => {
      if (!googleTokens[t]) throw new Error('invalid');
      return googleTokens[t];
    },
  });
});

async function signUp(email: string) {
  const res = await request(app).post('/auth/register').send({ email, password: 'hunter2hunter2' });
  expect(res.status).toBe(201);
  return { Authorization: `Bearer ${res.body.token}` };
}

describe('website', () => {
  it('serves the landing page and the label maker without signing in', async () => {
    const home = await request(app).get('/');
    expect(home.status).toBe(200);
    expect(home.text).toContain('LinenTag');
    const labels = await request(app).get('/labels');
    expect(labels.status).toBe(200);
    expect(labels.text).toContain('Labels for bedding you already own');
    const tags = await request(app).get('/nfc-tags');
    expect(tags.status).toBe(200);
    expect(tags.text).toContain('Sew-in NFC tags');
  });
});

describe('waitlist', () => {
  it('accepts sign-ups without an account, and re-signing up updates the entry', async () => {
    const first = await request(app)
      .post('/waitlist')
      .send({ name: 'Sam', email: 'Sam@Example.com', usageType: 'airbnb', company: 'Lake Cabins', source: 'home-hero' });
    expect(first.status).toBe(201);
    const again = await request(app).post('/waitlist').send({ name: 'Sam R', email: 'sam@example.com', usageType: 'hotel' });
    expect(again.status).toBe(201);
    expect((await request(app).post('/waitlist').send({ name: '', email: 'x', usageType: 'spaceship' })).status).toBe(400);
  });
});

describe('auth', () => {
  it('registers, rejects duplicates, logs in, and returns the current user', async () => {
    await signUp('a@example.com');
    const dup = await request(app).post('/auth/register').send({ email: 'A@example.com', password: 'hunter2hunter2' });
    expect(dup.status).toBe(409);

    const bad = await request(app).post('/auth/login').send({ email: 'a@example.com', password: 'wrongwrong' });
    expect(bad.status).toBe(401);

    const login = await request(app).post('/auth/login').send({ email: 'A@example.com', password: 'hunter2hunter2' });
    expect(login.status).toBe(200);
    const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.body.user.email).toBe('a@example.com');
  });

  it('requires a token for protected routes', async () => {
    expect((await request(app).get('/items')).status).toBe(401);
    expect((await request(app).get('/items').set('Authorization', 'Bearer nope')).status).toBe(401);
  });

  it('signs in with Google and links to an existing account by verified email', async () => {
    const existing = await request(app).post('/auth/register').send({ email: 'host@example.com', password: 'hunter2hunter2' });
    const g = await request(app).post('/auth/google').send({ idToken: 'good-token' });
    expect(g.status).toBe(200);
    expect(g.body.user.id).toBe(existing.body.user.id);
    const again = await request(app).post('/auth/google').send({ idToken: 'good-token' });
    expect(again.body.user.id).toBe(existing.body.user.id);
    expect((await request(app).post('/auth/google').send({ idToken: 'forged' })).status).toBe(401);
  });
});

describe('setup, storage places, set colours', () => {
  it('starts un-onboarded with default settings and saves setup answers', async () => {
    const auth = await signUp('setup@example.com');
    const before = await request(app).get('/auth/me').set(auth);
    expect(before.body.user).toMatchObject({ onboarded: false, settings: { multipleLocations: false, trackWashes: true } });

    const done = await request(app)
      .patch('/auth/me')
      .set(auth)
      .send({ onboarded: true, settings: { multipleLocations: true, trackWashes: false } });
    expect(done.body.user).toMatchObject({ onboarded: true, settings: { multipleLocations: true, trackWashes: false } });

    // Partial updates merge; unknown settings are rejected.
    const partial = await request(app).patch('/auth/me').set(auth).send({ settings: { trackWashes: true } });
    expect(partial.body.user.settings).toEqual({ multipleLocations: true, trackWashes: true });
    expect((await request(app).patch('/auth/me').set(auth).send({ settings: { bogus: 1 } })).status).toBe(400);

    // Login returns the same shape.
    const login = await request(app).post('/auth/login').send({ email: 'setup@example.com', password: 'hunter2hunter2' });
    expect(login.body.user.onboarded).toBe(true);
  });

  it('manages storage places and assigns sets to them', async () => {
    const auth = await signUp('places@example.com');
    const hall = await request(app).post('/locations').set(auth).send({ name: 'Hall closet' });
    expect(hall.status).toBe(201);
    await request(app).post('/locations').set(auth).send({ name: 'Bedroom closet' });
    const list = await request(app).get('/locations').set(auth);
    expect(list.body.locations.map((l: any) => l.name)).toEqual(['Hall closet', 'Bedroom closet']);

    const set = await request(app).post('/sets').set(auth).send({ name: 'Guest', locationId: hall.body.location.id });
    expect(set.body.set).toMatchObject({ locationId: hall.body.location.id, locationName: 'Hall closet' });

    const renamed = await request(app).patch(`/locations/${hall.body.location.id}`).set(auth).send({ name: 'Hallway' });
    expect(renamed.body.location.name).toBe('Hallway');
    expect((await request(app).get(`/sets/${set.body.set.id}`).set(auth)).body.set.locationName).toBe('Hallway');

    // Deleting a place keeps the set, just without a place.
    expect((await request(app).delete(`/locations/${hall.body.location.id}`).set(auth)).status).toBe(204);
    expect((await request(app).get(`/sets/${set.body.set.id}`).set(auth)).body.set).toMatchObject({ locationId: null, locationName: null });

    // Another account's place can't be used.
    const other = await signUp('places2@example.com');
    const theirs = await request(app).post('/locations').set(other).send({ name: 'Theirs' });
    expect((await request(app).patch(`/sets/${set.body.set.id}`).set(auth).send({ locationId: theirs.body.location.id })).status).toBe(400);
  });

  it('auto-assigns distinct colours and lets them be changed', async () => {
    const auth = await signUp('colors@example.com');
    const colors = [];
    for (const name of ['A', 'B', 'C']) colors.push((await request(app).post('/sets').set(auth).send({ name })).body.set.color);
    expect(colors).toEqual(['blue', 'green', 'yellow']);
    const id = (await request(app).get('/sets').set(auth)).body.sets[0].id;
    const changed = await request(app).patch(`/sets/${id}`).set(auth).send({ color: 'pink' });
    expect(changed.body.set.color).toBe('pink');
    expect((await request(app).patch(`/sets/${id}`).set(auth).send({ color: 'plaid' })).status).toBe(400);
  });
});

describe('set laundry cycle', () => {
  it('keeps one set in use per room, sending the previous one to the laundry', async () => {
    const auth = await signUp('cycle@example.com');
    const mk = async (name: string, room: string | null) =>
      (await request(app).post('/sets').set(auth).send({ name, room })).body.set;
    const a = await mk('Master A', 'Master bedroom');
    const b = await mk('Master B', ' master Bedroom ');
    const guest = await mk('Guest', 'Guest room');
    const roomless = await mk('Spare', null);
    expect(a.status).toBe('stored');

    const useA = await request(app).post(`/sets/${a.id}/use`).set(auth);
    expect(useA.body.set.status).toBe('in_use');
    expect(useA.body.sentToLaundry).toEqual([]);
    await request(app).post(`/sets/${guest.id}/use`).set(auth);
    await request(app).post(`/sets/${roomless.id}/use`).set(auth);

    // Same room (case/space-insensitive): A goes to the laundry. Other rooms are untouched.
    const useB = await request(app).post(`/sets/${b.id}/use`).set(auth);
    expect(useB.body.sentToLaundry).toEqual([{ id: a.id, name: 'Master A' }]);
    const statuses = Object.fromEntries((await request(app).get('/sets').set(auth)).body.sets.map((s: any) => [s.name, s.status]));
    expect(statuses).toEqual({ 'Master A': 'laundry', 'Master B': 'in_use', Guest: 'in_use', Spare: 'in_use' });

    // Using the set that's already in use changes nothing else.
    expect((await request(app).post(`/sets/${b.id}/use`).set(auth)).body.sentToLaundry).toEqual([]);

    // Put away after washing.
    const stored = await request(app).patch(`/sets/${a.id}`).set(auth).send({ status: 'stored' });
    expect(stored.body.set).toMatchObject({ status: 'stored' });
    expect(stored.body.set.statusChangedAt).toBeTruthy();
    expect((await request(app).patch(`/sets/${a.id}`).set(auth).send({ status: 'dirty' })).status).toBe(400);

    const other = await signUp('cycle-other@example.com');
    expect((await request(app).post(`/sets/${a.id}/use`).set(other)).status).toBe(404);
  });
});

describe('product label intake', () => {
  const piece = (pieceNo: number, extra: Record<string, unknown> = {}) => ({
    name: pieceNo <= 2 ? ['Fitted Sheet', 'Flat Sheet'][pieceNo - 1] : `Pillowcase ${pieceNo - 2}`,
    type: pieceNo === 1 ? 'fitted_sheet' : pieceNo === 2 ? 'flat_sheet' : 'pillowcase',
    size: 'king',
    material: '100% Cotton',
    color: 'White',
    packCode: 'PACK-0001',
    setName: 'Classic White King',
    pieceCount: 4,
    pieceNo,
    ...extra,
  });

  it('turns a pack of labels into one set, without duplicates', async () => {
    const auth = await signUp('intake@example.com');
    const hall = (await request(app).post('/locations').set(auth).send({ name: 'Hall closet' })).body.location;

    const first = await request(app)
      .post('/intake')
      .set(auth)
      .send({ product: piece(1), tagUid: 'AA:BB:CC:DD:01', room: 'Main bedroom', locationId: hall.id, purchaseDate: '2026-10-21' });
    expect(first.body.item.purchaseDate).toBe('2026-10-21');
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ itemCreated: true, setCreated: true });
    expect(first.body.item).toMatchObject({ name: 'Fitted Sheet', size: 'king', room: 'Main bedroom', tagUid: 'AABBCCDD01' });
    expect(first.body.set).toMatchObject({ name: 'Classic White King', room: 'Main bedroom', locationName: 'Hall closet', expectedPieces: 4 });
    expect(first.body.set.color).toBeTruthy();

    for (const n of [2, 3, 4]) {
      const r = await request(app).post('/intake').set(auth).send({ product: piece(n), room: 'Main bedroom' });
      expect(r.body.setCreated).toBe(false);
      expect(r.body.set.id).toBe(first.body.set.id);
    }
    const set = (await request(app).get(`/sets/${first.body.set.id}`).set(auth)).body.set;
    expect(set.items).toHaveLength(4);

    // Same label again: returns the existing item, and can attach a tag it was missing.
    const again = await request(app).post('/intake').set(auth).send({ product: piece(3), tagUid: 'AABBCCDD03' });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ itemCreated: false, item: { name: 'Pillowcase 1', tagUid: 'AABBCCDD03' } });
    expect((await request(app).get('/items').set(auth)).body.items).toHaveLength(4);

    // Scanning a label finds the item it was registered as.
    const lookup = await request(app).post('/intake/lookup').set(auth).send({ name: 'Pillowcase 1', packCode: 'PACK-0001', pieceNo: 3 });
    expect(lookup.body.item).toMatchObject({ name: 'Pillowcase 1', tagUid: 'AABBCCDD03' });
    const unknown = await request(app).post('/intake/lookup').set(auth).send({ name: 'x', packCode: 'NOPE', pieceNo: 1 });
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe('LABEL_NOT_REGISTERED');
    const other = await signUp('intake-lookup-other@example.com');
    expect((await request(app).post('/intake/lookup').set(other).send({ name: 'Pillowcase 1', packCode: 'PACK-0001', pieceNo: 3 })).status).toBe(404);

    // The scanned tag now identifies the item and its set.
    const scan = await request(app).post('/scan').set(auth).send({ tagUid: 'AABBCCDD03' });
    expect(scan.body.set.items).toHaveLength(4);

    // A tag can't be reused for another piece.
    const clash = await request(app).post('/intake').set(auth).send({ product: piece(5, { name: 'Pillowcase 3' }), tagUid: 'AABBCCDD01' });
    expect(clash.status).toBe(409);
    expect(clash.body.error.code).toBe('TAG_IN_USE');
  });

  it('adds labelled items to a chosen set, using its room', async () => {
    const auth = await signUp('intake-set@example.com');
    const guest = (await request(app).post('/sets').set(auth).send({ name: 'Guest set', room: 'Guest room' })).body.set;

    const r = await request(app).post('/intake').set(auth).send({ product: piece(1, { packCode: 'OTHER-PACK' }), setId: guest.id });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ setCreated: false, set: { id: guest.id }, item: { room: 'Guest room', setId: guest.id } });

    // A label already registered elsewhere gets moved into the chosen set.
    const elsewhere = await request(app).post('/intake').set(auth).send({ product: piece(2, { packCode: 'PACK-X' }) });
    expect(elsewhere.body.set.id).not.toBe(guest.id);
    const moved = await request(app).post('/intake').set(auth).send({ product: piece(2, { packCode: 'PACK-X' }), setId: guest.id });
    expect(moved.body).toMatchObject({ itemCreated: false, item: { setId: guest.id } });
    expect((await request(app).get(`/sets/${guest.id}`).set(auth)).body.set.items).toHaveLength(2);

    const other = await signUp('intake-set2@example.com');
    expect((await request(app).post('/intake').set(other).send({ product: piece(1), setId: guest.id })).status).toBe(400);
  });

  it('keeps packs separate per account and handles labels without a pack', async () => {
    const a = await signUp('intake-a@example.com');
    const b = await signUp('intake-b@example.com');
    const ra = await request(app).post('/intake').set(a).send({ product: piece(1) });
    const rb = await request(app).post('/intake').set(b).send({ product: piece(1) });
    expect(ra.body.set.id).not.toBe(rb.body.set.id);

    // Home-made labels ("FE…" IDs) are counted as candidates for NFC tags.
    await request(app).post('/intake').set(a).send({ product: piece(2), tagUid: 'FE0011223344' });
    expect((await request(app).get('/dashboard').set(a)).body.printedLabelItems).toBe(1);

    const loose = await request(app).post('/intake').set(a).send({ product: { name: 'Spare blanket', type: 'blanket' } });
    expect(loose.status).toBe(201);
    expect(loose.body).toMatchObject({ set: null, setCreated: false, item: { setId: null } });

    expect((await request(app).post('/intake').set(a).send({ product: { name: 'x', type: 'towel' } })).status).toBe(400);
  });
});

describe('items, tags, sets, scanning', () => {
  it('runs the full register -> scan -> set flow', async () => {
    const auth = await signUp('owner@example.com');

    // Register a tag on creation; UID formatting is normalised.
    const fitted = await request(app)
      .post('/items')
      .set(auth)
      .send({ name: 'Fitted Sheet', type: 'fitted_sheet', size: 'king', material: '100% Cotton', color: 'White', room: 'Master Bedroom', tagUid: '04:a2:3b:4c:5d:6e:7f', purchaseDate: '2026-01-15' });
    expect(fitted.status).toBe(201);
    expect(fitted.body.item).toMatchObject({ tagUid: '04A23B4C5D6E7F', washCount: 0, purchaseDate: '2026-01-15', notes: null });

    const pillow = await request(app).post('/items').set(auth).send({ name: 'Pillowcase 1', type: 'pillowcase', size: 'king', room: 'Master Bedroom' });
    expect(pillow.status).toBe(201);
    // No purchase date given: it's the day the item was added.
    expect(pillow.body.item.purchaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // "Today" is the database's local date, which can differ from the UTC date near midnight.
    const created = new Date(pillow.body.item.createdAt);
    const localDate = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`;
    expect([created.toISOString().slice(0, 10), localDate]).toContain(pillow.body.item.purchaseDate);

    // Link a tag afterwards; the same tag can't be reused.
    const linked = await request(app).put(`/items/${pillow.body.item.id}/tag`).set(auth).send({ tagUid: '04B1C2D3E4F5A6' });
    expect(linked.body.item.tagUid).toBe('04B1C2D3E4F5A6');
    const clash = await request(app).put(`/items/${pillow.body.item.id}/tag`).set(auth).send({ tagUid: '04A23B4C5D6E7F' });
    expect(clash.status).toBe(409);
    expect(clash.body.error.code).toBe('TAG_IN_USE');

    // Create a set containing both items.
    const set = await request(app)
      .post('/sets')
      .set(auth)
      .send({ name: 'Master Bedroom Set', room: 'Master Bedroom', itemIds: [fitted.body.item.id, pillow.body.item.id] });
    expect(set.status).toBe(201);
    expect(set.body.set.items).toHaveLength(2);

    // Scanning one piece shows the whole set; wash scans increment the counter.
    const scan = await request(app).post('/scan').set(auth).send({ tagUid: '04a23b4c5d6e7f', wash: true });
    expect(scan.status).toBe(200);
    expect(scan.body.item.washCount).toBe(1);
    expect(scan.body.item.lastWashedAt).toBeTruthy();
    expect(scan.body.set.name).toBe('Master Bedroom Set');
    expect(scan.body.set.items.map((i: any) => i.name).sort()).toEqual(['Fitted Sheet', 'Pillowcase 1']);

    const plain = await request(app).post('/scan').set(auth).send({ tagUid: '04B1C2D3E4F5A6' });
    expect(plain.body.item.washCount).toBe(0);

    const unknown = await request(app).post('/scan').set(auth).send({ tagUid: 'DEADBEEF' });
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe('TAG_NOT_REGISTERED');

    // Filters.
    const kings = await request(app).get('/items?size=king&room=master%20bedroom').set(auth);
    expect(kings.body.items).toHaveLength(2);
    const pillows = await request(app).get('/items?type=pillowcase').set(auth);
    expect(pillows.body.items.map((i: any) => i.name)).toEqual(['Pillowcase 1']);
    const inSet = await request(app).get(`/items?setId=${set.body.set.id}&q=fitted`).set(auth);
    expect(inSet.body.items).toHaveLength(1);

    // Dashboard: most recent scan first.
    const dash = await request(app).get('/dashboard').set(auth);
    expect(dash.body).toMatchObject({ totalItems: 2, totalSets: 1, printedLabelItems: 0 });
    expect(dash.body.recentlyScanned.map((r: any) => r.item.name)).toEqual(['Pillowcase 1', 'Fitted Sheet']);

    // Edit, then shrink set membership.
    const edited = await request(app).patch(`/items/${fitted.body.item.id}`).set(auth).send({ notes: 'Deep pocket mattress', status: 'in_laundry' });
    expect(edited.body.item).toMatchObject({ notes: 'Deep pocket mattress', status: 'in_laundry', name: 'Fitted Sheet' });
    const shrunk = await request(app).patch(`/sets/${set.body.set.id}`).set(auth).send({ itemIds: [fitted.body.item.id] });
    expect(shrunk.body.set.items).toHaveLength(1);
    expect(shrunk.body.set.room).toBe('Master Bedroom');

    // Moving a set to another room moves its pieces; items outside the set stay put.
    const moved = await request(app).patch(`/sets/${set.body.set.id}`).set(auth).send({ room: 'Guest room' });
    expect(moved.body.set.items.map((i: any) => i.room)).toEqual(['Guest room']);
    expect((await request(app).get(`/items/${pillow.body.item.id}`).set(auth)).body.item.room).toBe('Master Bedroom');

    // Deleting a set keeps its items; deleting an item frees its tag.
    expect((await request(app).delete(`/sets/${set.body.set.id}`).set(auth)).status).toBe(204);
    const orphan = await request(app).get(`/items/${fitted.body.item.id}`).set(auth);
    expect(orphan.body.item.setId).toBeNull();
    expect((await request(app).delete(`/items/${fitted.body.item.id}`).set(auth)).status).toBe(204);
    expect((await request(app).get(`/items/${fitted.body.item.id}`).set(auth)).status).toBe(404);
    expect((await request(app).post('/scan').set(auth).send({ tagUid: '04A23B4C5D6E7F' })).status).toBe(404);
  });

  it('isolates accounts', async () => {
    const alice = await signUp('alice@example.com');
    const bob = await signUp('bob@example.com');
    const item = await request(app).post('/items').set(alice).send({ name: 'Duvet', type: 'duvet_cover', tagUid: 'AABBCCDDEEFF' });
    const aliceSet = await request(app).post('/sets').set(alice).send({ name: 'Guest' });

    expect((await request(app).get(`/items/${item.body.item.id}`).set(bob)).status).toBe(404);
    expect((await request(app).patch(`/items/${item.body.item.id}`).set(bob).send({ name: 'x' })).status).toBe(404);
    expect((await request(app).delete(`/items/${item.body.item.id}`).set(bob)).status).toBe(404);
    expect((await request(app).post('/scan').set(bob).send({ tagUid: 'AABBCCDDEEFF' })).status).toBe(404);
    expect((await request(app).post('/sets').set(bob).send({ name: 'Steal', itemIds: [item.body.item.id] })).status).toBe(400);
    expect((await request(app).post('/items').set(bob).send({ name: 'x', type: 'other', setId: aliceSet.body.set.id })).status).toBe(400);
    expect((await request(app).get('/items').set(bob)).body.items).toEqual([]);
  });

  it('validates input', async () => {
    const auth = await signUp('v@example.com');
    expect((await request(app).post('/items').set(auth).send({ name: '', type: 'fitted_sheet' })).status).toBe(400);
    expect((await request(app).post('/items').set(auth).send({ name: 'x', type: 'towel' })).status).toBe(400);
    expect((await request(app).post('/items').set(auth).send({ name: 'x', type: 'other', tagUid: '12' })).status).toBe(400);
    expect((await request(app).get('/items/not-a-uuid').set(auth)).status).toBe(404);
    expect((await request(app).patch('/items/00000000-0000-0000-0000-000000000000').set(auth).send({})).status).toBe(400);
  });
});
