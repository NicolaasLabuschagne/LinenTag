-- No purchase date given: assume the day the item was added. Backfill existing items the same way.
ALTER TABLE items ALTER COLUMN purchase_date SET DEFAULT CURRENT_DATE;
UPDATE items SET purchase_date = created_at::date WHERE purchase_date IS NULL;
