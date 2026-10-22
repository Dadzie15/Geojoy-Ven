-- GeoJoy Ventures online store: deals (Phase 2, Screen 8)
-- Run after 0002_catalogue.sql.

-- ---------------------------------------------------------------------------
-- Products: saving = old price - price
-- PostgREST can only filter and sort by columns, so "on sale" (old price above
-- the price) and the Deals page's "Biggest saving" sort read this column.
-- null when there is no old price; 0 or less is not a deal.
-- ---------------------------------------------------------------------------
alter table products
  add column if not exists saving numeric(10, 2) generated always as (compare_at_price - price) stored;

create index if not exists products_active_saving_idx on products (saving desc) where is_active and saving > 0;
