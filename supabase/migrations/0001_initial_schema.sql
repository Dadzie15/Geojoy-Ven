-- GeoJoy Ventures online store: initial schema
-- Matches SRS v1.1 (13 Oct 2026): email + password accounts, MoMo via Paystack,
-- nationwide delivery with a fee quoted per order and paid to the rider on arrival.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'staff', 'owner');

create type order_status as enum (
  'pending_payment',   -- order created, waiting for MoMo approval (cancelled after 24 h)
  'paid',              -- paid; needs a delivery quote
  'quote_sent',        -- delivery fee sent to the customer by email / WhatsApp
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type payment_status as enum ('pending', 'success', 'failed', 'refunded');

create type ghana_region as enum (
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra',
  'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West',
  'Volta', 'Western', 'Western North'
);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,                                  -- optional on accounts
  role user_role not null default 'customer',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  region ghana_region not null,
  city text not null,
  area_landmark text not null,
  gps_address text,                            -- GhanaPost GPS, optional
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories (id) on delete set null,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories (id) on delete set null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),          -- "from" price when variants exist
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  badge text,                                                 -- e.g. 'New', 'Deal'
  is_bulky boolean not null default false,                    -- may cost more to deliver
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null,                                         -- e.g. 'Model C', 'Large'
  price numeric(10, 2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  sku text unique,
  sort_order int not null default 0
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order int not null default 0
);

create table saved_items (
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Orders, payments, delivery quotes
-- ---------------------------------------------------------------------------
create sequence order_number_seq start 10234;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('GJV-' || nextval('order_number_seq')),
  user_id uuid references profiles (id) on delete set null,   -- null for guest checkout
  customer_name text not null,
  email text not null,
  phone text not null,                                         -- required: the rider calls it
  region ghana_region not null,
  city text not null,
  area_landmark text not null,
  gps_address text,
  delivery_notes text,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total_paid numeric(10, 2) not null check (total_paid >= 0), -- items only; delivery paid to rider
  promo_code text,
  status order_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  variant_id uuid references product_variants (id) on delete set null,
  name text not null,                                          -- copied at purchase time
  variant_name text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  provider text not null default 'paystack',
  reference text not null unique,                              -- Paystack reference
  amount numeric(10, 2) not null,
  network text,                                                -- MTN, Telecel, AirtelTigo
  status payment_status not null default 'pending',
  raw jsonb,                                                   -- verified Paystack response
  created_at timestamptz not null default now()
);

create table delivery_quotes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  fee numeric(10, 2) not null check (fee >= 0),                -- paid to the rider, not online
  rider_name text not null,
  rider_phone text not null,
  expected_date date,
  sent_via text[] not null default '{email,whatsapp}',
  sent_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Store content and settings
-- ---------------------------------------------------------------------------
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz
);

create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off int check (percent_off between 1 and 100),
  amount_off numeric(10, 2) check (amount_off > 0),
  min_order numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  check (percent_off is not null or amount_off is not null)
);

create table store_settings (
  id int primary key default 1 check (id = 1),                 -- single row
  whatsapp_number text not null default '233557843743',
  opening_hours text not null default 'Mon–Fri, 9am–7pm',
  reply_time_text text not null default 'Usually replies within 1 hour',
  unpaid_order_cancel_hours int not null default 24,
  returns_window_days int not null default 7
);
insert into store_settings (id) values (1);

-- ---------------------------------------------------------------------------
-- Helpers and triggers
-- ---------------------------------------------------------------------------
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('staff', 'owner')
  );
$$;

-- Create a profile row whenever someone signs up (email + password).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on products
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Orders, payments and quotes are written by the server with the service role key,
-- which bypasses RLS. Customers can only read their own records.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table saved_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table delivery_quotes enable row level security;
alter table banners enable row level security;
alter table promo_codes enable row level security;
alter table store_settings enable row level security;

-- Public catalogue
create policy "catalogue: public read" on categories for select using (is_active or is_staff());
create policy "catalogue: public read" on products for select using (is_active or is_staff());
create policy "catalogue: public read" on product_variants for select using (true);
create policy "catalogue: public read" on product_images for select using (true);
create policy "banners: public read" on banners for select using (is_active or is_staff());
create policy "settings: public read" on store_settings for select using (true);

-- Staff manage the catalogue and content
create policy "catalogue: staff write" on categories for all using (is_staff()) with check (is_staff());
create policy "catalogue: staff write" on products for all using (is_staff()) with check (is_staff());
create policy "catalogue: staff write" on product_variants for all using (is_staff()) with check (is_staff());
create policy "catalogue: staff write" on product_images for all using (is_staff()) with check (is_staff());
create policy "banners: staff write" on banners for all using (is_staff()) with check (is_staff());
create policy "promo: staff all" on promo_codes for all using (is_staff()) with check (is_staff());
create policy "settings: staff update" on store_settings for update using (is_staff()) with check (is_staff());

-- Customers: own profile, addresses, saved items
create policy "profiles: own read" on profiles for select using (id = auth.uid() or is_staff());
create policy "profiles: own update" on profiles for update using (id = auth.uid() or is_staff())
  with check (id = auth.uid() or is_staff());

-- Only the owner can change someone's role (stops customers making themselves staff).
-- The SQL editor / service role (no signed-in user) can always set it, e.g. to make the first owner:
--   update profiles set role = 'owner' where id = '<owner user id>';
create or replace function guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not exists (select 1 from profiles where id = auth.uid() and role = 'owner') then
    raise exception 'Only the store owner can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on profiles
  for each row execute function guard_profile_role();
create policy "addresses: own all" on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "saved: own all" on saved_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders: customers read their own; staff read and update all
create policy "orders: own read" on orders for select using (user_id = auth.uid() or is_staff());
create policy "orders: staff update" on orders for update using (is_staff()) with check (is_staff());
create policy "order items: own read" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));
create policy "payments: staff read" on payments for select using (is_staff());
create policy "quotes: own read" on delivery_quotes for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));
create policy "quotes: staff write" on delivery_quotes for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index on products (category_id) where is_active;
create index on product_variants (product_id);
create index on product_images (product_id);
create index on orders (user_id);
create index on orders (status, created_at desc);
create index on order_items (order_id);
create index on addresses (user_id);
