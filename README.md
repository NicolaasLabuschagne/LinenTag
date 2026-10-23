# LinenTag

Tap a phone on a washable NFC capsule sewn into a sheet's seam, and see what the item is, which set it belongs to, and how often it's been washed.

```
server/   Node + TypeScript + Express API on PostgreSQL (also serves web/)
mobile/   React Native + Expo (SDK 58, Expo Router) app
website/  Marketing website (Next.js 15): see website/README.md
web/      Simple pages served by the API: landing, /labels label maker, /nfc-tags (superseded by website/)
tools/    Factory label maker prototype (for manufacturers)
```

## How a scan works

1. The app reads the tag's **UID**. Nothing is written to the tag, so any blank washable NTAG21x or ICODE laundry tag works.
2. If that tag has been scanned before, the app shows the cached result straight away, including when the phone is offline.
3. `POST /scan` returns the item plus every piece in its set. If "Count as a wash" is on, it also adds one to the item's wash count.
4. If no item has that tag yet, the app offers two options: **Register a new item** with the tag, or **Link to an existing item**.

## Server

```bash
cd server
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npm install
npm run migrate             # applies migrations/*.sql
npm run dev                 # http://localhost:4000
npm test                    # API tests against in-process Postgres (PGlite), no DB needed
```

**Hosting.** Either host works with only a `DATABASE_URL`:
- **Supabase:** use it for Postgres. Copy the connection string and append `?sslmode=require`.
- **Railway:** add the Postgres plugin and deploy `server/` with build `npm run build`, start `npm run migrate && npm start`. Note that `migrate` runs through `tsx`, so keep dev dependencies installed, or run migrations as a separate step.

### API

Every route except `/auth/*` and `/health` needs `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` `/auth/login` | Email + password → `{ token, user }` |
| POST | `/auth/google` | `{ idToken }` from Google Sign-In → `{ token, user }` |
| GET | `/auth/me` | Current user |
| POST | `/scan` | `{ tagUid, wash? }` → `{ item, set }`, or 404 `TAG_NOT_REGISTERED` |
| GET | `/items` | Filters: `size type status room material setId q` |
| POST/GET/PATCH/DELETE | `/items[/:id]` | Item CRUD. You can pass `tagUid` when creating |
| PUT/DELETE | `/items/:id/tag` | Link or unlink a tag. Returns 409 `TAG_IN_USE` if another item already has the tag |
| POST/GET/PATCH/DELETE | `/sets[/:id]` | Set CRUD. `itemIds` replaces the whole list of pieces |
| GET | `/dashboard` | Total items, total sets, last 10 scanned items |

Tag UIDs are stored as bare uppercase hex, so `04:a2:3b…` and `04A23B…` are the same tag. Each tag can belong to only one item across all accounts. A tag owned by a different account looks unregistered to you.

## Mobile

NFC and Google Sign-In use native code, so the app runs as a **development build**. It does not run in Expo Go.

```bash
cd mobile
cp .env.example .env        # EXPO_PUBLIC_API_URL = your machine's LAN IP, not localhost
npm install
npx expo run:android        # or run:ios; or: npx eas-cli@latest build --profile development
```

Test on a physical device. Simulators have no NFC.

**Google Sign-In setup.** In Google Cloud Console, create OAuth client IDs:
- **Web application:** set as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Its ID tokens are what the server verifies.
- **iOS:** set as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and set its reversed form as `GOOGLE_IOS_URL_SCHEME`.
- **Android:** add your signing key's SHA-1. Nothing goes in the env file for this one.

Then put all of these client IDs in the server's `GOOGLE_CLIENT_IDS`. Re-run prebuild after you change `GOOGLE_IOS_URL_SCHEME`.

**Product labels.** New bedding is added by scanning the QR label on each item (**Add new bedding**). The label carries the item's details, plus a pack code shared by every piece in the pack, so a pack becomes one set automatically. If the label also carries the sewn-in tag's ID, no NFC tap is needed. The format is documented in `mobile/src/lib/product.ts`. To make test labels, open `tools/label-maker.html` in a browser.

**Testing without NFC tags.** Wherever you can scan or link a tag, the app also offers a **QR test tag** option. Any QR code acts as a tag: one containing hex (such as `04:A2:3B:4C`) is used as that UID, and anything else is hashed to a stable ID. To turn this off, set `QR_TEST_TAGS` to `false` in `mobile/src/lib/qr.ts`.

**iOS NFC.** This needs a paid Apple developer account with the NFC Tag Reading capability, which the config plugin adds to the entitlements.

## Not in the MVP yet

- Condition rating and replacement recommendations. Wash count and last-washed date are already tracked.
- Queuing wash scans made while offline. Right now the app tells you when an offline scan's wash was not recorded.
- Shared accounts or teams for hotels and laundries.
