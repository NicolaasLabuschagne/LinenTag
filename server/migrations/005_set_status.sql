-- Where a set is in the laundry cycle: put away in its storage place, on the bed, or in the wash.
ALTER TABLE linen_sets ADD COLUMN status text NOT NULL DEFAULT 'stored'
  CHECK (status IN ('stored', 'in_use', 'laundry'));
ALTER TABLE linen_sets ADD COLUMN status_changed_at timestamptz;
