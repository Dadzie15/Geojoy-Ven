import "server-only";
import {
  DEFAULT_SORT,
  MAX_NUMBERED_PAGE,
  PAGE_STEP,
  PRODUCTS_PER_PAGE,
  type CatalogueParams,
  type RawSearchParams,
} from "./params";
import { parseCatalogueParams } from "./parse-params";
import type {
  CategoryDetail,
  ListProductsOptions,
  ProductList,
  ProductSort,
  SearchProductsOptions,
  SearchSort,
} from "./types";

/** Listings without a query never sort by relevance (the parser already drops it; this narrows the type). */
const listingSort = (sort: SearchSort): ProductSort => (sort === "relevance" ? DEFAULT_SORT : sort);

/**
 * Validated URL state for a category page plus the matching listProducts options.
 * Type filters are kept only when they are children of this category.
 */
export function resolveCategoryListing(
  category: CategoryDetail,
  raw: RawSearchParams,
): { params: CatalogueParams; options: ListProductsOptions } {
  const parsed = parseCatalogueParams(raw);
  const childSlugs = new Set(category.children.map((child) => child.slug));
  const params = { ...parsed, types: parsed.types.filter((slug) => childSlugs.has(slug)) };

  return {
    params,
    options: {
      category: params.types.length > 0 ? params.types : category.slug,
      minPrice: params.min,
      maxPrice: params.max,
      inStock: params.inStock,
      onSale: params.onSale,
      sort: listingSort(params.sort),
      page: 1,
      pageSize: params.page * PAGE_STEP,
    },
  };
}

/**
 * Validated URL state for All products: sort and page only (the page has no filters, so filter
 * params are dropped). The page is not clamped yet; loadClampedPage does that once the total is known.
 */
export function resolveAllProductsListing(raw: RawSearchParams): {
  params: CatalogueParams;
  options: ListProductsOptions;
} {
  const parsed = parseCatalogueParams(raw, { maxPage: MAX_NUMBERED_PAGE });
  const sort = listingSort(parsed.sort);
  return {
    params: { types: [], inStock: false, onSale: false, sort, page: parsed.page },
    options: { sort, page: parsed.page, pageSize: PRODUCTS_PER_PAGE },
  };
}

/**
 * Validated URL state for Search (q is already normalised and not empty) plus the matching
 * searchProducts options. Category filters ("type") are kept only when they are top-level category
 * slugs; the page is clamped later by loadClampedPage.
 */
export function resolveSearchListing(
  q: string,
  raw: RawSearchParams,
  topLevelSlugs: ReadonlySet<string>,
): { params: CatalogueParams; options: SearchProductsOptions } {
  const parsed = parseCatalogueParams(raw, { maxPage: MAX_NUMBERED_PAGE, search: true });
  const params = { ...parsed, q, types: parsed.types.filter((slug) => topLevelSlugs.has(slug)) };

  return {
    params,
    options: {
      category: params.types.length > 0 ? params.types : undefined,
      minPrice: params.min,
      maxPrice: params.max,
      inStock: params.inStock,
      onSale: params.onSale,
      sort: params.sort,
      page: params.page,
      pageSize: PRODUCTS_PER_PAGE,
    },
  };
}

/** Number of pages for a result, at least 1. */
export function pageCount({ total, pageSize }: Pick<ProductList, "total" | "pageSize">): number {
  return Math.max(Math.ceil(total / pageSize), 1);
}

/**
 * Loads a numbered page; a page past the end loads the last page instead (All products, Search, Deals).
 * A page past the end comes back with no count, so page 1 is loaded first to find the total.
 */
export async function loadClampedPage(load: (page: number) => Promise<ProductList>, page: number): Promise<ProductList> {
  const list = await load(page);
  if (page === 1 || list.items.length > 0) return list;

  const first = await load(1);
  const last = pageCount(first);
  return last === 1 ? first : load(last);
}
