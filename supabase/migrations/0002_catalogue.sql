-- GeoJoy Ventures online store: catalogue data and search (Phase 2, Module 2.1)
-- Run after 0001_initial_schema.sql, then run supabase/seed.sql for demo data.

-- pg_trgm powers partial-word and typo matching ("ket", "blend", "kettel").
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Products: popularity, specifications, full-text search
-- ---------------------------------------------------------------------------
alter table products
  add column popularity int not null default 0,              -- "Most popular" sort, "Popular right now"
  add column specs jsonb not null default '[]'                -- [{ "label": text, "value": text }]
    check (jsonb_typeof(specs) = 'array'),
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

-- ---------------------------------------------------------------------------
-- Indexes
-- products(category_id) and product_variants(product_id) already exist from 0001
-- under these names, so the first two statements are no-ops on an up-to-date database.
-- ---------------------------------------------------------------------------
create index if not exists products_category_id_idx on products (category_id) where is_active;
create index if not exists product_variants_product_id_idx on product_variants (product_id);
create index if not exists products_active_popularity_idx on products (is_active, popularity desc);
create index if not exists products_search_vector_idx on products using gin (search_vector);
create index if not exists products_name_trgm_idx on products using gin (name extensions.gin_trgm_ops);

-- Replaces 0001's product_images(product_id) index: the new one also serves gallery order.
create index if not exists product_images_product_sort_idx on product_images (product_id, sort_order);
drop index if exists product_images_product_id_idx;

-- ---------------------------------------------------------------------------
-- Search
-- security invoker: runs as the caller, so RLS still applies. The query text is
-- only ever used as a value, never as SQL. Results come back ranked: full-text
-- matches first, then trigram (partial word / typo) and ilike matches.
-- ---------------------------------------------------------------------------
create or replace function search_products(q text)
returns setof products
language sql stable security invoker
set search_path = public, extensions
as $$
  with query as (
    select
      websearch_to_tsquery('english', coalesce(q, '')) as tsq,
      btrim(coalesce(q, '')) as term,
      -- Escape LIKE wildcards so "%" or "_" in the search box match literally.
      '%' || replace(replace(replace(btrim(coalesce(q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.*
  from products p, query
  where p.is_active
    and query.term <> ''
    and (
      p.search_vector @@ query.tsq
      or query.term <% p.name
      or p.name ilike query.pattern
    )
  order by
    (p.search_vector @@ query.tsq) desc,
    ts_rank(p.search_vector, query.tsq) desc,
    word_similarity(query.term, p.name) desc,
    p.popularity desc,
    p.name;
$$;
