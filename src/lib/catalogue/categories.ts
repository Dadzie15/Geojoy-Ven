import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { CategoryDetail, CategoryLink, CategoryNode } from "./types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  products: { count: number }[];
};

/** Just the link fields of a category. */
export function toLink({ id, name, slug }: CategoryLink): CategoryLink {
  return { id, name, slug };
}

/**
 * Active top-level categories with their active children, in sort_order, with
 * active product counts. A parent's count includes its children's products.
 * Cached per request, so pages and the data layer can call it freely.
 */
export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, products(count)")
    .eq("is_active", true)
    .eq("products.is_active", true)
    .order("sort_order")
    .order("name")
    .overrideTypes<CategoryRow[], { merge: false }>();
  if (error) throw new Error(`Could not load categories: ${error.message}`);

  const toNode = (row: CategoryRow): CategoryNode => ({
    ...toLink(row),
    sortOrder: row.sort_order,
    productCount: row.products[0]?.count ?? 0,
    children: [],
  });

  const parents = data.filter((row) => row.parent_id === null).map(toNode);
  const byId = new Map(parents.map((node) => [node.id, node]));

  // Children of an inactive parent have no entry in byId and are dropped.
  for (const row of data) {
    const parent = row.parent_id ? byId.get(row.parent_id) : undefined;
    if (!parent) continue;
    const child = toNode(row);
    parent.children.push(child);
    parent.productCount += child.productCount;
  }

  return parents;
});

/** A category (top-level or child) with its parent, children and breadcrumb; null when missing or inactive. */
export async function getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  for (const top of await getCategoryTree()) {
    if (top.slug === slug) return { ...top, parent: null, breadcrumb: [toLink(top)] };

    const child = top.children.find((node) => node.slug === slug);
    if (child) return { ...child, parent: toLink(top), breadcrumb: [toLink(top), toLink(child)] };
  }
  return null;
}

/** Ids of a category and its children, used to filter products; null when the slug is unknown. */
export async function getCategoryIds(slug: string): Promise<string[] | null> {
  const category = await getCategoryBySlug(slug);
  return category ? [category.id, ...category.children.map((child) => child.id)] : null;
}
