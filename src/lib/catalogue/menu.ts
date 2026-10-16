import "server-only";
import { toPesewas } from "@/lib/format";
import { getCategoryTree } from "./categories";
import { listProducts } from "./products";
import type { MenuCategory, MenuDeal } from "./types";

/** The most popular on-sale product in a category (or the whole shop), as a promo card deal. */
async function firstDeal(category?: string): Promise<MenuDeal | null> {
  const { items } = await listProducts({ category, onSale: true, sort: "popular", pageSize: 1 });
  const product = items[0];
  if (!product?.oldPrice) return null;
  return {
    name: product.name,
    href: product.href,
    image: product.image,
    saving: ((toPesewas(product.oldPrice) - toPesewas(product.price)) / 100).toFixed(2),
  };
}

/**
 * Top-level categories with their children and a deal for the header menus. Every read goes
 * through the cached public client, so the storefront layout can call it and pages stay static.
 */
export async function getMenuCategories(): Promise<MenuCategory[]> {
  const tree = await getCategoryTree();
  const [shopDeal, ...deals] = await Promise.all([firstDeal(), ...tree.map((category) => firstDeal(category.slug))]);

  return tree.map((category, index) => ({
    name: category.name,
    slug: category.slug,
    children: category.children.map(({ name, slug }) => ({ name, slug })),
    deal: deals[index] ?? shopDeal,
  }));
}
