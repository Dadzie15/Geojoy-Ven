import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { getCategoryIds, getCategoryTree, toLink } from "./categories";
import type {
  CategoryLink,
  ListProductsOptions,
  Money,
  Pagination,
  PriceRange,
  PriceRangeScope,
  ProductCardData,
  ProductDetail,
  ProductFilters,
  ProductList,
  ProductSort,
  ProductSpec,
  SearchProductsOptions,
  SearchSort,
} from "./types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 60;

// Money columns are cast to text so numeric(10,2) values arrive as exact strings.
const CARD_COLUMNS =
  "id, slug, name, price::text, compare_at_price::text, categories(name), product_variants(price::text, stock), product_images(url, alt)";

/** Product row as selected by CARD_COLUMNS. */
export type ProductCardRow = {
  id: string;
  slug: string;
  name: string;
  price: Money;
  compare_at_price: Money | null;
  categories: { name: string } | null;
  product_variants: { price: Money; stock: number }[];
  product_images: { url: string; alt: string }[];
};

/** Turns a product row into ProductCard props. No image gives the card's placeholder. */
export function toProductCard(row: ProductCardRow): ProductCardData {
  const image = row.product_images[0];
  return {
    id: row.id,
    href: `/product/${row.slug}`,
    name: row.name,
    category: row.categories?.name ?? "",
    price: row.price,
    oldPrice: row.compare_at_price ?? undefined,
    image: image ? { src: image.url, alt: image.alt || row.name } : undefined,
    priceFrom: new Set(row.product_variants.map((variant) => variant.price)).size > 1,
    inStock: row.product_variants.some((variant) => variant.stock > 0),
  };
}

// ---------------------------------------------------------------------------
// Shared query building for listProducts, searchProducts and getPriceRange
// ---------------------------------------------------------------------------

/** All active products, or search_products(q) results when q is given. RLS applies to both. */
function productSource(columns: string, q?: string, withCount = false) {
  const client = createPublicClient();
  const count = withCount ? "exact" : undefined;
  return q === undefined
    ? client.from("products").select(columns, { count }).eq("is_active", true)
    : client.rpc("search_products", { q }, { get: true, count }).select(columns);
}

type ProductQuery = ReturnType<typeof productSource>;

/** Category ids the filters allow; null means no category filter, [] means nothing can match. */
async function resolveCategoryIds({ category, subcategory }: ProductFilters): Promise<string[] | null> {
  const slugs = category === undefined ? [] : [category].flat();
  const [categoryIdLists, subcategoryIds] = await Promise.all([
    Promise.all(slugs.map(getCategoryIds)),
    subcategory ? getCategoryIds(subcategory) : null,
  ]);
  // Unknown slugs are skipped; if none are known, nothing can match.
  const categoryIds = slugs.length > 0 ? categoryIdLists.flatMap((ids) => ids ?? []) : null;
  if (categoryIds?.length === 0) return [];
  if (subcategory && !subcategoryIds) return [];
  if (categoryIds && subcategoryIds) return subcategoryIds.filter((id) => categoryIds.includes(id));
  return subcategoryIds ?? categoryIds;
}

function applyFilters(query: ProductQuery, filters: ProductFilters, categoryIds: string[] | null): ProductQuery {
  if (categoryIds) query = query.in("category_id", categoryIds);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.onSale) query = query.not("compare_at_price", "is", null);
  // Needs the in_stock embed from cardColumns(filters).
  if (filters.inStock) query = query.gt("in_stock.stock", 0);
  return query;
}

/** Card columns, plus an inner-joined variant embed used only to filter "in stock". */
function cardColumns(filters: ProductFilters) {
  return filters.inStock ? `${CARD_COLUMNS}, in_stock:product_variants!inner()` : CARD_COLUMNS;
}

const SORT_ORDER: Record<ProductSort, { column: string; ascending: boolean }> = {
  popular: { column: "popularity", ascending: false },
  newest: { column: "created_at", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
};

/** An empty result for the requested (clamped) page. */
function emptyList({ page, pageSize }: Pagination): ProductList {
  return {
    items: [],
    total: 0,
    page: Math.max(Math.trunc(page ?? 1), 1),
    pageSize: Math.min(Math.max(Math.trunc(pageSize ?? DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE),
  };
}

async function findProducts(
  options: SearchProductsOptions,
  defaultSort: SearchSort,
  q?: string,
): Promise<ProductList> {
  const empty = emptyList(options);
  const { page, pageSize } = empty;

  const categoryIds = await resolveCategoryIds(options);
  if (categoryIds?.length === 0) return empty;

  let query = applyFilters(productSource(cardColumns(options), q, true), options, categoryIds);

  // "relevance" keeps the ranking search_products returns.
  const sort = options.sort ?? defaultSort;
  if (sort !== "relevance") {
    const { column, ascending } = SORT_ORDER[sort];
    query = query.order(column, { ascending }).order("name").order("id");
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order("sort_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" })
    .range(from, from + pageSize - 1)
    .overrideTypes<ProductCardRow[], { merge: false }>();

  // PGRST103: the page is past the last result.
  if (error?.code === "PGRST103") return empty;
  if (error) throw new Error(`Could not load products: ${error.message}`);

  return { items: data.map(toProductCard), total: count ?? 0, page, pageSize };
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/** Active products with filters, sort (default "popular") and pagination. */
export function listProducts(options: ListProductsOptions = {}): Promise<ProductList> {
  return findProducts(options, "popular");
}

/** Search results with the same filters and pagination as listProducts; sorted by relevance by default. */
export async function searchProducts(q: string, options: SearchProductsOptions = {}): Promise<ProductList> {
  const term = q.trim();
  return term ? findProducts(options, "relevance", term) : emptyList(options);
}

type ProductDetailRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: Money;
  compare_at_price: Money | null;
  badge: string | null;
  is_bulky: boolean;
  specs: unknown;
  category_id: string | null;
  product_variants: { id: string; name: string; price: Money; stock: number; sku: string | null }[];
  product_images: { id: string; url: string; alt: string }[];
};

/** Keeps only well-formed { label, value } entries from the specs jsonb column. */
function toSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) return [];
    const { label, value: specValue } = item as Record<string, unknown>;
    return typeof label === "string" && typeof specValue === "string" ? [{ label, value: specValue }] : [];
  });
}

/** An active product with its category (and parent), sorted variants and images, and specs; null when missing or inactive. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [result, tree] = await Promise.all([
    createPublicClient()
      .from("products")
      .select(
        "id, slug, name, description, price::text, compare_at_price::text, badge, is_bulky, specs, category_id, " +
          "product_variants(id, name, price::text, stock, sku, sort_order), product_images(id, url, alt, sort_order)",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .order("sort_order", { referencedTable: "product_variants" })
      .order("sort_order", { referencedTable: "product_images" })
      .maybeSingle()
      .overrideTypes<ProductDetailRow | null, { merge: false }>(),
    getCategoryTree(),
  ]);
  if (result.error) throw new Error(`Could not load product: ${result.error.message}`);
  const row = result.data;
  if (!row) return null;

  let category: CategoryLink | null = null;
  let parentCategory: CategoryLink | null = null;
  for (const top of tree) {
    const child = top.children.find((node) => node.id === row.category_id);
    if (top.id === row.category_id || child) {
      category = child ?? top;
      parentCategory = child ? top : null;
      break;
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    badge: row.badge,
    isBulky: row.is_bulky,
    specs: toSpecs(row.specs),
    category: category && toLink(category),
    parentCategory: parentCategory && toLink(parentCategory),
    variants: row.product_variants.map(({ id, name, price, stock, sku }) => ({ id, name, price, stock, sku })),
    images: row.product_images.map(({ id, url, alt }) => ({ id, url, alt: alt || row.name })),
  };
}

/** Other active products in the same category, most popular first. One round trip via the product's category. */
export async function getRelatedProducts(productId: string, limit = 4): Promise<ProductCardData[]> {
  const related = "categories.products";
  const { data, error } = await createPublicClient()
    .from("products")
    .select(`categories(products(${CARD_COLUMNS}))`)
    .eq("id", productId)
    .eq("is_active", true)
    .eq(`${related}.is_active`, true)
    .neq(`${related}.id`, productId)
    .order("popularity", { referencedTable: related, ascending: false })
    .order("name", { referencedTable: related })
    .limit(limit, { referencedTable: related })
    .order("sort_order", { referencedTable: `${related}.product_images` })
    .limit(1, { referencedTable: `${related}.product_images` })
    .maybeSingle()
    .overrideTypes<{ categories: { products: ProductCardRow[] } | null } | null, { merge: false }>();
  if (error) throw new Error(`Could not load related products: ${error.message}`);

  return (data?.categories?.products ?? []).map(toProductCard);
}

/** Lowest and highest product price in a category or a search, for the price filter; null when nothing matches. */
export async function getPriceRange(scope: PriceRangeScope): Promise<PriceRange | null> {
  const q = "q" in scope ? scope.q.trim() : undefined;
  if (q === "") return null;
  const filters: ProductFilters = "category" in scope ? { category: scope.category } : {};

  const categoryIds = await resolveCategoryIds(filters);
  if (categoryIds?.length === 0) return null;

  const cheapest = (ascending: boolean) =>
    applyFilters(productSource("price::text", q), filters, categoryIds)
      .order("price", { ascending })
      .limit(1)
      .maybeSingle()
      .overrideTypes<{ price: Money } | null, { merge: false }>();

  const [low, high] = await Promise.all([cheapest(true), cheapest(false)]);
  const error = low.error ?? high.error;
  if (error) throw new Error(`Could not load price range: ${error.message}`);

  return low.data && high.data ? { min: low.data.price, max: high.data.price } : null;
}
