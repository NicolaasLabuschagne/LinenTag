-- Sign-ups from the marketing website.
CREATE TABLE waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  company    text,
  usage_type text NOT NULL,
  source     text,
  created_at timestamptz NOT NULL DEFAULT now()
);
