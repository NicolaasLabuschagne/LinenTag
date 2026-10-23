-- Answers from first-run setup; unknown keys fall back to defaults in the API.
ALTER TABLE users ADD COLUMN settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN onboarded_at timestamptz;

-- Where linen is stored (closets, cupboards). Only used when the user has more than one.
CREATE TABLE locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX locations_user_idx ON locations(user_id);

ALTER TABLE linen_sets ADD COLUMN color text;
ALTER TABLE linen_sets ADD COLUMN location_id uuid REFERENCES locations(id) ON DELETE SET NULL;
