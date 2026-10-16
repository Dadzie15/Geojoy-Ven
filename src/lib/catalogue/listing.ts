import "server-only";
import { PAGE_STEP, type CatalogueParams, type RawSearchParams } from "./params";
import { parseCatalogueParams } from "./parse-params";
import type { CategoryDetail, ListProductsOptions } from "./types";

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
      sort: params.sort,
      page: 1,
      pageSize: params.page * PAGE_STEP,
    },
  };
}
