"use server";

import { getCategoryBySlug } from "./categories";
import { resolveCategoryListing } from "./listing";
import { searchParamsToRaw } from "./params";
import { listProducts } from "./products";

/**
 * Number of products a category would show with the given query string (e.g. "?type=kettles&stock=1").
 * Powers "Show N products" in the filter sheet. Both arguments come from the browser, so both are
 * validated: an unknown slug or bad query counts as 0 / is ignored like on the page itself.
 */
export async function countCategoryProducts(slug: unknown, query: unknown): Promise<number> {
  if (typeof slug !== "string" || typeof query !== "string" || query.length > 2000) return 0;
  const category = await getCategoryBySlug(slug);
  if (!category) return 0;

  const { options } = resolveCategoryListing(category, searchParamsToRaw(new URLSearchParams(query)));
  const { total } = await listProducts({ ...options, page: 1, pageSize: 1 });
  return total;
}
