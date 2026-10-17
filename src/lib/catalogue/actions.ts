"use server";

import { getCategoryBySlug, getCategoryTree } from "./categories";
import { resolveCategoryListing, resolveSearchListing } from "./listing";
import { normaliseQuery, searchParamsToRaw } from "./params";
import { listProducts, searchProducts } from "./products";

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

/**
 * Number of products a search would show with the given query string (e.g. "?q=pot&type=cookware").
 * Powers "Show N products" in the Search filter sheet. The search term comes from the query string
 * and is normalised like on the page; an empty term counts as 0.
 */
export async function countSearchProducts(query: unknown): Promise<number> {
  if (typeof query !== "string" || query.length > 2000) return 0;
  const raw = searchParamsToRaw(new URLSearchParams(query));
  const q = normaliseQuery(raw.q);
  if (!q) return 0;

  const tree = await getCategoryTree();
  const { options } = resolveSearchListing(q, raw, new Set(tree.map((category) => category.slug)));
  const { total } = await searchProducts(q, { ...options, page: 1, pageSize: 1 });
  return total;
}
