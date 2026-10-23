CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text,
  google_sub    text UNIQUE,
  name          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE linen_sets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  room       text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX linen_sets_user_idx ON linen_sets(user_id);

CREATE TABLE items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id         uuid REFERENCES linen_sets(id) ON DELETE SET NULL,
  -- A physical tag can only ever belong to one item, across all accounts.
  tag_uid        text UNIQUE,
  name           text NOT NULL,
  type           text NOT NULL,
  size           text,
  material       text,
  color          text,
  room           text,
  notes          text,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_laundry', 'retired')),
  purchase_date  date,
  wash_count     integer NOT NULL DEFAULT 0,
  last_washed_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX items_user_idx ON items(user_id);
CREATE INDEX items_set_idx ON items(set_id);

CREATE TABLE scans (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  washed     boolean NOT NULL DEFAULT false,
  scanned_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scans_user_time_idx ON scans(user_id, scanned_at DESC);
