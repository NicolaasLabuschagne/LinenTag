-- Product labels: items from one retail pack share a pack code and become one set.
ALTER TABLE linen_sets ADD COLUMN pack_code text;
ALTER TABLE linen_sets ADD COLUMN expected_pieces integer;
CREATE UNIQUE INDEX linen_sets_user_pack_idx ON linen_sets(user_id, pack_code) WHERE pack_code IS NOT NULL;

-- Identifies one piece of a pack, so scanning the same label twice doesn't add a duplicate.
ALTER TABLE items ADD COLUMN product_ref text;
CREATE UNIQUE INDEX items_user_product_ref_idx ON items(user_id, product_ref) WHERE product_ref IS NOT NULL;
