import type { ProductSort } from "./types";

/**
 * Catalogue listing state kept in the URL (category, All products, Search, Deals):
 *   ?type=kettles&type=hot-plates&min=150&max=800&stock=1&sale=1&sort=price_asc&page=2
 * Every field is validated on its own; an invalid value is dropped, never an error.
 * This file has no dependencies so client controls can build URLs with it; parsing (zod) lives
 * in parse-params.ts on the server.
 */

/** Products added by each "Load more". */
export const PAGE_STEP = 9;
export const MAX_PAGE = 20;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];
export const DEFAULT_SORT: ProductSort = "popular";

export type CatalogueParams = {
  /** Child-category slugs ("Type" filter). */
  types: string[];
  /** Whole cedis. */
  min?: number;
  max?: number;
  inStock: boolean;
  onSale: boolean;
  sort: ProductSort;
  /** Load-more page: the listing shows the first page × PAGE_STEP products. */
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

/** True when the URL differs from the plain listing (used for noindex). */
export function isRefinedView(params: CatalogueParams): boolean {
  return countActiveFilters(params) > 0 || params.sort !== DEFAULT_SORT || params.page > 1;
}

/** Query string for the given state, leaving out defaults, e.g. "?type=kettles&sort=newest" or "". */
export function toQueryString(params: CatalogueParams): string {
  const query = new URLSearchParams();
  for (const type of params.types) query.append("type", type);
  if (params.min !== undefined) query.set("min", String(params.min));
  if (params.max !== undefined) query.set("max", String(params.max));
  if (params.inStock) query.set("stock", "1");
  if (params.onSale) query.set("sale", "1");
  if (params.sort !== DEFAULT_SORT) query.set("sort", params.sort);
  if (params.page > 1) query.set("page", String(params.page));
  const value = query.toString();
  return value ? `?${value}` : "";
}

/** URL for a listing with some state changed. Changing filters or sort goes back to page 1 unless a page is given. */
export function catalogueHref(pathname: string, params: CatalogueParams, changes: Partial<CatalogueParams> = {}): string {
  return pathname + toQueryString({ ...params, page: 1, ...changes });
}

/** The state with every filter cleared (sort kept). */
export function clearedParams(params: CatalogueParams): CatalogueParams {
  return { types: [], inStock: false, onSale: false, sort: params.sort, page: 1 };
}
