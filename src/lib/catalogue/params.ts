import type { CatalogueSort, DealSort, ProductSort, SearchSort } from "./types";

/**
 * Catalogue listing state kept in the URL (category, All products, Search, Deals):
 *   ?type=kettles&type=hot-plates&min=150&max=800&stock=1&sale=1&sort=price_asc&page=2
 * Search puts the query first (?q=pot&type=cookware) and sorts by relevance by default.
 * Deals filter by one top-level category (?category=cookware) and sort by biggest saving by default.
 * Every field is validated on its own; an invalid value is dropped, never an error.
 * This file has no dependencies so client controls can build URLs with it; parsing (zod) lives
 * in parse-params.ts on the server.
 */

/** Products added by each "Load more". */
export const PAGE_STEP = 9;
export const MAX_PAGE = 20;
/** Products per page on listings with numbered pagination (All products). */
export const PRODUCTS_PER_PAGE = 20;
/** Highest page number read from the URL on paginated listings; a page past the end shows the last page. */
export const MAX_NUMBERED_PAGE = 9999;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];
export const DEFAULT_SORT: ProductSort = "popular";

/** Search results add "Relevance" (their default) before the usual options. */
export const SEARCH_SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  ...SORT_OPTIONS,
];

/** Deals add "Biggest saving" (their default) before the usual options. */
export const DEALS_SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: "saving", label: "Biggest saving" },
  ...SORT_OPTIONS,
];

/** Longest search query kept; longer queries are cut. */
export const MAX_QUERY_LENGTH = 100;

export type CatalogueParams = {
  /** Search query (trimmed, at most MAX_QUERY_LENGTH characters); only on the Search page. */
  q?: string;
  /** The Deals page: "saving" is allowed and is the default sort. Not part of the URL. */
  deals?: boolean;
  /** Top-level category slug; only on the Deals page. */
  category?: string;
  /** Child-category slugs ("Type" filter); top-level category slugs on Search ("Category" filter). */
  types: string[];
  /** Whole cedis. */
  min?: number;
  max?: number;
  inStock: boolean;
  onSale: boolean;
  /** "relevance" only on Search, "saving" only on Deals. */
  sort: CatalogueSort;
  /** Load-more page (the listing shows the first page × PAGE_STEP products), or the page number on paginated listings. */
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** URLSearchParams as the record shape Next.js passes to pages (repeated keys become arrays). */
export function searchParamsToRaw(query: URLSearchParams): RawSearchParams {
  const raw: RawSearchParams = {};
  for (const key of new Set(query.keys())) {
    const values = query.getAll(key);
    raw[key] = values.length > 1 ? values : values[0];
  }
  return raw;
}

/** Number of active filters (types count one each; a price range counts once). Sort and page are not filters. */
export function countActiveFilters(params: CatalogueParams): number {
  const price = params.min !== undefined || params.max !== undefined ? 1 : 0;
  return params.types.length + price + Number(params.inStock) + Number(params.onSale);
}

/** "relevance" on Search, "saving" on Deals, "popular" everywhere else. */
export function defaultSortFor(params: Pick<CatalogueParams, "q" | "deals">): CatalogueSort {
  if (params.q !== undefined) return "relevance";
  return params.deals ? "saving" : DEFAULT_SORT;
}

/** The "Sort by" options a listing offers. */
export function sortOptionsFor(params: Pick<CatalogueParams, "q" | "deals">): { value: CatalogueSort; label: string }[] {
  if (params.q !== undefined) return SEARCH_SORT_OPTIONS;
  return params.deals ? DEALS_SORT_OPTIONS : SORT_OPTIONS;
}

/** Trimmed and cut to MAX_QUERY_LENGTH; "" when there is nothing to search for. */
export function normaliseQuery(value: unknown): string {
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === "string" ? text.trim().slice(0, MAX_QUERY_LENGTH).trim() : "";
}

/** True when the URL differs from the plain listing (used for noindex). */
export function isRefinedView(params: CatalogueParams): boolean {
  return (
    countActiveFilters(params) > 0 ||
    params.category !== undefined ||
    params.sort !== defaultSortFor(params) ||
    params.page > 1
  );
}

/** Query string for the given state, leaving out defaults, e.g. "?type=kettles&sort=newest" or "". */
export function toQueryString(params: CatalogueParams): string {
  const query = new URLSearchParams();
  if (params.q !== undefined) query.set("q", params.q);
  if (params.category !== undefined) query.set("category", params.category);
  for (const type of params.types) query.append("type", type);
  if (params.min !== undefined) query.set("min", String(params.min));
  if (params.max !== undefined) query.set("max", String(params.max));
  if (params.inStock) query.set("stock", "1");
  if (params.onSale) query.set("sale", "1");
  if (params.sort !== defaultSortFor(params)) query.set("sort", params.sort);
  if (params.page > 1) query.set("page", String(params.page));
  const value = query.toString();
  return value ? `?${value}` : "";
}

/** URL for a listing with some state changed. Changing filters or sort goes back to page 1 unless a page is given. */
export function catalogueHref(pathname: string, params: CatalogueParams, changes: Partial<CatalogueParams> = {}): string {
  return pathname + toQueryString({ ...params, page: 1, ...changes });
}

/** The state with every filter cleared (query and sort kept). */
export function clearedParams(params: CatalogueParams): CatalogueParams {
  return { q: params.q, types: [], inStock: false, onSale: false, sort: params.sort, page: 1 };
}
