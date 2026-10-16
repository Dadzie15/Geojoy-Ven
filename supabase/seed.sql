-- =============================================================================
-- DEMO DATA – replace when the client confirms the product list
-- =============================================================================
-- Source: docs/seed-products.csv (the client's sales list, still to be confirmed).
-- Descriptions and specs are plain placeholders written for review only.
-- No product images: real photos come later.
--
-- Run after supabase/migrations/0002_catalogue.sql. Safe to run more than once:
-- categories and products upsert on slug, variants on sku, the banner is inserted
-- only if missing. Re-running resets demo prices and stock to the values below.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
insert into categories (name, slug, parent_id, sort_order, is_active)
values
  ('Kitchen Appliances',     'kitchen-appliances', null, 1, true),
  ('Cookware',               'cookware',           null, 2, true),
  ('Storage & Organisation', 'storage',            null, 3, true),
  ('Laundry',                'laundry',            null, 4, true),
  ('Cleaning',               'cleaning',           null, 5, true),
  ('Bathroom',               'bathroom',           null, 6, true),
  ('Mats',                   'mats',               null, 7, true),
  ('Furniture',              'furniture',          null, 8, true),
  ('Other',                  'other',              null, 9, false)  -- hidden until the client confirms its items
on conflict (slug) do update
  set name = excluded.name,
      parent_id = excluded.parent_id,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

insert into categories (name, slug, parent_id, sort_order, is_active)
select child.name, child.slug, parent.id, child.sort_order, true
from (
  values
    ('Kettles',            'kettles',           1),
    ('Blenders & Juicers', 'blenders-juicers',  2),
    ('Cookers & Fryers',   'cookers-fryers',    3),
    ('Food Warmers',       'food-warmers',      4),
    ('Hot Plates',         'hot-plates',        5)
) as child (name, slug, sort_order)
join categories parent on parent.slug = 'kitchen-appliances'
on conflict (slug) do update
  set name = excluded.name,
      parent_id = excluded.parent_id,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

-- -----------------------------------------------------------------------------
-- Variants (one row per CSV row). Loaded first so products.price can be set to
-- the lowest variant price in the same statement that creates the product.
-- -----------------------------------------------------------------------------
create temp table seed_variant (
  product_slug text not null,
  name text not null,
  price numeric(10, 2) not null,
  stock int not null,
  sort_order int not null
) on commit drop;

insert into seed_variant (product_slug, name, price, stock, sort_order)
values
  ('blender',            'Standard',  500, 10, 1),
  ('4-in-1-blender',     'Standard',  550, 10, 1),
  ('electric-kettle',    'Model A',   150, 10, 1),
  ('electric-kettle',    'Model B',   170, 10, 2),
  ('electric-kettle',    'Model C',   200, 10, 3),
  ('electric-kettle',    'Model D',   250, 10, 4),
  ('electric-kettle',    'Model E',   300,  0, 5),  -- out of stock (demo)
  ('juicer',             'Standard',  800, 10, 1),
  ('rice-cooker',        'Standard',  500, 10, 1),
  ('air-fryer',          'Standard',  600, 10, 1),
  ('sandwich-maker',     'Standard',  250, 10, 1),
  ('food-warmer',        'Small',     300, 10, 1),
  ('food-warmer',        'Large',     650, 10, 2),
  ('hot-plate',          'Small',     250, 10, 1),
  ('hot-plate',          'Big',       600, 10, 2),
  ('winning-star-5l',    '5L',        350, 10, 1),
  ('hot-chef',           'Standard', 1100, 10, 1),
  ('cooking-pot',        'Standard',  500, 10, 1),
  ('pot',                'Size A',    500, 10, 1),
  ('pot',                'Size B',    600, 10, 2),
  ('cast-iron-pot',      'Standard', 2000, 10, 1),
  ('non-stick-set',      'Black',    1500, 10, 1),
  ('utensil-set',        'Full set', 1400, 10, 1),
  ('utensil-set',        'Big',       450, 10, 2),
  ('dinner-utensil-set', 'Standard',  150, 10, 1),
  ('kitchen-rack',       'Standard',  300, 10, 1),
  ('dish-drainer',       'Standard',  350, 10, 1),
  ('storage-container',  'Standard',  250, 10, 1),
  ('tiele',              'Standard',  600, 10, 1),
  ('tiele',              'Small',     350, 10, 2),
  ('tiele-box',          'Standard',  600, 10, 1),
  ('tiele-container',    'Standard',  350, 10, 1),
  ('basket',             'Standard',   70, 10, 1),
  ('ice-chest',          'Small',      50,  0, 1),  -- out of stock (demo)
  ('ice-chest',          'Large',    1200, 10, 2),
  ('dry-line',           'Model A',   300, 10, 1),
  ('dry-line',           'Model B',   350, 10, 2),
  ('dry-line',           'Model C',   600, 10, 3),
  ('cloth-rack',         'Standard',  200, 10, 1),
  ('ironing-board',      'Standard',  250, 10, 1),
  ('mop',                'Model A',   400, 10, 1),
  ('mop',                'Model B',   450, 10, 2),
  ('toilet-rack',        'Small',     200, 10, 1),
  ('toilet-rack',        'Medium',    350, 10, 2),
  ('toilet-rack',        'Large',    2500, 10, 3),
  ('toilet-mat',         'Standard',   70, 10, 1),
  ('washroom-mat',       'Standard',   30, 10, 1),
  ('door-mat',           'Standard',   25, 10, 1),
  ('door-mat',           'Big',        30, 10, 2),
  ('door-mat',           'Premium',   200, 10, 3),
  ('silk-door-mat',      'Standard',   25, 10, 1),
  ('big-mat',            'Standard',   30, 10, 1),
  ('car-mat',            'Standard',   25, 10, 1),
  ('table-mat',          'Standard',  200, 10, 1),
  ('table',              'Standard',  450, 10, 1),
  ('table',              'Small',     330, 10, 2),
  ('table',              'Big Round', 400, 10, 3),
  ('chairs',             'Set of 4',  800, 10, 1),
  ('diaper',             'Standard',  700, 10, 1);

-- -----------------------------------------------------------------------------
-- Products. popularity = "Times on Sales List" (summed across a product's rows).
-- Unclear items and the "Other" category are inactive until the client confirms.
-- -----------------------------------------------------------------------------
insert into products (
  slug, name, category_id, description, price, compare_at_price, popularity, specs, is_active
)
select
  p.slug,
  p.name,
  c.id,
  p.description,
  (select min(v.price) from seed_variant v where v.product_slug = p.slug),
  p.compare_at_price,
  p.popularity,
  p.specs::jsonb,
  p.is_active
from (
  values
  -- Kitchen Appliances
  ('blender', 'Blender', 'blenders-juicers', 2, null::numeric, true,
   'An electric blender for smoothies, soups, pepper and sauces.',
   '[{"label":"Type","value":"Countertop blender"},{"label":"Power","value":"Electric"},{"label":"Jar","value":"Removable, with lid"}]'),
  ('4-in-1-blender', '4-in-1 Blender', 'blenders-juicers', 2, 600, true,
   'A blender with extra attachments for blending, grinding, chopping and mixing.',
   '[{"label":"Type","value":"Multi-function blender"},{"label":"Functions","value":"4 in 1"},{"label":"Power","value":"Electric"}]'),
  ('electric-kettle', 'Electric Kettle', 'kettles', 6, null, true,
   'A cordless electric kettle for boiling water for tea, coffee and cooking. Available in five models.',
   '[{"label":"Type","value":"Cordless kettle"},{"label":"Models","value":"A to E"},{"label":"Power","value":"Electric"}]'),
  ('juicer', 'Juicer', 'blenders-juicers', 1, null, true,
   'An electric juicer for fresh fruit and vegetable juice at home.',
   '[{"label":"Type","value":"Electric juicer"},{"label":"Power","value":"Electric"}]'),
  ('rice-cooker', 'Rice Cooker', 'cookers-fryers', 1, null, true,
   'An electric rice cooker that cooks and keeps rice warm.',
   '[{"label":"Type","value":"Electric rice cooker"},{"label":"Keep warm","value":"Yes"},{"label":"Power","value":"Electric"}]'),
  ('air-fryer', 'Air Fryer', 'cookers-fryers', 1, 680, true,
   'An air fryer for crisp chips, chicken and plantain with little or no oil.',
   '[{"label":"Type","value":"Air fryer"},{"label":"Basket","value":"Removable"},{"label":"Power","value":"Electric"}]'),
  ('sandwich-maker', 'Sandwich Maker', 'cookers-fryers', 1, null, true,
   'A sandwich maker for toasted sandwiches in a few minutes.',
   '[{"label":"Type","value":"Sandwich toaster"},{"label":"Plates","value":"Non-stick"},{"label":"Power","value":"Electric"}]'),
  ('food-warmer', 'Food Warmer', 'food-warmers', 2, 700, true,
   'An insulated food warmer that keeps cooked food hot for serving. Available in small and large.',
   '[{"label":"Type","value":"Insulated food warmer"},{"label":"Sizes","value":"Small, Large"}]'),
  ('hot-plate', 'Hot Plate', 'hot-plates', 3, 650, true,
   'An electric hot plate for cooking where there is no gas cooker. Available in small and big.',
   '[{"label":"Type","value":"Electric hot plate"},{"label":"Sizes","value":"Small, Big"},{"label":"Power","value":"Electric"}]'),
  ('winning-star-5l', 'Winning Star 5L', 'kitchen-appliances', 2, null, true,
   'A 5 litre Winning Star kitchen appliance.',
   '[{"label":"Brand","value":"Winning Star"},{"label":"Capacity","value":"5 L"}]'),
  -- Cookware
  ('hot-chef', 'Hot Chef', 'cookware', 1, null, true,
   'Hot Chef cookware for the family kitchen.',
   '[{"label":"Brand","value":"Hot Chef"},{"label":"Use","value":"Everyday cooking"}]'),
  ('cooking-pot', 'Cooking Pot', 'cookware', 2, null, true,
   'A cooking pot with lid for stews, soups and rice.',
   '[{"label":"Type","value":"Pot with lid"},{"label":"Use","value":"Stews, soups, rice"}]'),
  ('pot', 'Pot ("Pod" in notes)', 'cookware', 9, null, false,
   'A cooking pot in two sizes.',
   '[{"label":"Type","value":"Pot"},{"label":"Sizes","value":"Size A, Size B"}]'),
  ('cast-iron-pot', 'Cast Iron Pot', 'cookware', 1, null, true,
   'A heavy cast iron pot that holds heat well for slow cooking and frying.',
   '[{"label":"Material","value":"Cast iron"},{"label":"Use","value":"Slow cooking, frying"},{"label":"Care","value":"Dry fully after washing"}]'),
  ('non-stick-set', 'Non-Stick Set', 'cookware', 1, 1650, true,
   'A set of non-stick pots and pans for cooking with less oil.',
   '[{"label":"Type","value":"Cookware set"},{"label":"Coating","value":"Non-stick"},{"label":"Colour","value":"Black"}]'),
  ('utensil-set', 'Utensil Set', 'cookware', 2, null, true,
   'A set of kitchen utensils for cooking and serving. Available as a full set or a big set.',
   '[{"label":"Type","value":"Kitchen utensils"},{"label":"Options","value":"Full set, Big"}]'),
  ('dinner-utensil-set', 'Dinner Utensil Set', 'cookware', 1, null, true,
   'A dinner set of cutlery for the table.',
   '[{"label":"Type","value":"Cutlery set"},{"label":"Use","value":"Dining table"}]'),
  -- Storage & Organisation
  ('kitchen-rack', 'Kitchen Rack', 'storage', 2, null, true,
   'A kitchen rack for keeping pots, plates and groceries tidy.',
   '[{"label":"Type","value":"Kitchen rack"},{"label":"Use","value":"Pots, plates, groceries"}]'),
  ('dish-drainer', 'Dish Drainer', 'storage', 1, null, true,
   'A dish drainer for drying plates, cups and cutlery after washing.',
   '[{"label":"Type","value":"Dish rack"},{"label":"Use","value":"Plates, cups, cutlery"}]'),
  ('storage-container', 'Storage Container', 'storage', 1, null, true,
   'A storage container with lid for food or household items.',
   '[{"label":"Type","value":"Container with lid"},{"label":"Use","value":"Food, household items"}]'),
  ('tiele', '"Tiele" (unclear)', 'storage', 3, null, false,
   'Item name to be confirmed by the client.',
   '[{"label":"Sizes","value":"Standard, Small"}]'),
  ('tiele-box', '"Tiele" Box', 'storage', 1, null, false,
   'Item name to be confirmed by the client.',
   '[{"label":"Type","value":"Box"}]'),
  ('tiele-container', '"Tiele" Container', 'storage', 1, null, false,
   'Item name to be confirmed by the client.',
   '[{"label":"Type","value":"Container"}]'),
  ('basket', 'Basket', 'storage', 2, null, true,
   'A basket for storage, laundry or carrying shopping.',
   '[{"label":"Type","value":"Basket"},{"label":"Use","value":"Storage, laundry, shopping"}]'),
  ('ice-chest', 'Ice Chest', 'storage', 2, null, true,
   'An insulated ice chest that keeps drinks and food cold. Available in small and large.',
   '[{"label":"Type","value":"Insulated cooler"},{"label":"Sizes","value":"Small, Large"}]'),
  -- Laundry
  ('dry-line', 'Dry Line', 'laundry', 5, null, true,
   'A folding clothes drying rack for indoors or outdoors. Available in three models.',
   '[{"label":"Type","value":"Clothes drying rack"},{"label":"Models","value":"A, B, C"},{"label":"Folds flat","value":"Yes"}]'),
  ('cloth-rack', 'Cloth Rack', 'laundry', 1, null, true,
   'A rack for hanging and storing clothes.',
   '[{"label":"Type","value":"Clothes rack"},{"label":"Use","value":"Hanging clothes"}]'),
  ('ironing-board', 'Ironing Board', 'laundry', 1, null, true,
   'A folding ironing board for pressing clothes at home.',
   '[{"label":"Type","value":"Ironing board"},{"label":"Folds flat","value":"Yes"}]'),
  -- Cleaning
  ('mop', 'Mop', 'cleaning', 3, null, true,
   'A floor mop for cleaning tiles and hard floors. Available in two models.',
   '[{"label":"Type","value":"Floor mop"},{"label":"Models","value":"A, B"}]'),
  -- Bathroom
  ('toilet-rack', 'Toilet Rack', 'bathroom', 3, null, true,
   'A bathroom rack for towels, toilet roll and toiletries. Available in small, medium and large.',
   '[{"label":"Type","value":"Bathroom rack"},{"label":"Sizes","value":"Small, Medium, Large"}]'),
  ('toilet-mat', 'Toilet Mat', 'bathroom', 1, null, true,
   'A soft mat for the toilet area.',
   '[{"label":"Type","value":"Toilet mat"},{"label":"Room","value":"Bathroom"}]'),
  ('washroom-mat', 'Washroom Mat', 'bathroom', 1, null, true,
   'A mat for the washroom floor.',
   '[{"label":"Type","value":"Bath mat"},{"label":"Room","value":"Washroom"}]'),
  -- Mats
  ('door-mat', 'Door Mat', 'mats', 3, null, true,
   'A door mat for wiping shoes at the entrance. Available in standard, big and premium.',
   '[{"label":"Type","value":"Door mat"},{"label":"Options","value":"Standard, Big, Premium"}]'),
  ('silk-door-mat', 'Silk Door Mat', 'mats', 1, null, true,
   'A soft door mat with a silky finish.',
   '[{"label":"Type","value":"Door mat"},{"label":"Finish","value":"Silky"}]'),
  ('big-mat', 'Big Mat', 'mats', 1, null, true,
   'A large floor mat for the living room or entrance.',
   '[{"label":"Type","value":"Floor mat"},{"label":"Size","value":"Big"}]'),
  ('car-mat', 'Car Mat', 'mats', 1, null, true,
   'A floor mat that keeps your car clean.',
   '[{"label":"Type","value":"Car floor mat"}]'),
  ('table-mat', 'Table Mat', 'mats', 1, null, true,
   'Table mats that protect the dining table from heat and spills.',
   '[{"label":"Type","value":"Table mat"},{"label":"Use","value":"Dining table"}]'),
  -- Furniture
  ('table', 'Table', 'furniture', 3, null, true,
   'A table for the home. Available in standard, small and big round.',
   '[{"label":"Type","value":"Table"},{"label":"Options","value":"Standard, Small, Big Round"}]'),
  ('chairs', 'Chairs', 'furniture', 1, null, true,
   'A set of four chairs for dining or sitting.',
   '[{"label":"Type","value":"Chairs"},{"label":"Quantity","value":"Set of 4"}]'),
  -- Other (hidden)
  ('diaper', 'Diaper (unclear)', 'other', 1, null, false,
   'Item name to be confirmed by the client.',
   '[]')
) as p (slug, name, category_slug, popularity, compare_at_price, is_active, description, specs)
join categories c on c.slug = p.category_slug
on conflict (slug) do update
  set name = excluded.name,
      category_id = excluded.category_id,
      description = excluded.description,
      price = excluded.price,
      compare_at_price = excluded.compare_at_price,
      popularity = excluded.popularity,
      specs = excluded.specs,
      is_active = excluded.is_active;

-- SKU: GJV-<PRODUCT SLUG>-<VARIANT NAME>, e.g. GJV-ELECTRIC-KETTLE-MODEL-A
insert into product_variants (product_id, name, price, stock, sku, sort_order)
select
  p.id,
  v.name,
  v.price,
  v.stock,
  upper('GJV-' || p.slug || '-' || trim(both '-' from regexp_replace(lower(v.name), '[^a-z0-9]+', '-', 'g'))),
  v.sort_order
from seed_variant v
join products p on p.slug = v.product_slug
on conflict (sku) do update
  set product_id = excluded.product_id,
      name = excluded.name,
      price = excluded.price,
      stock = excluded.stock,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Banner
-- -----------------------------------------------------------------------------
insert into banners (title, subtitle, image_url, link_url, sort_order, is_active)
select
  'Kitchen essentials week',
  'Up to 15% off blenders, air fryers and food warmers. Pay securely with Mobile Money.',
  null,
  '/deals',
  1,
  true
where not exists (select 1 from banners where title = 'Kitchen essentials week');

commit;
