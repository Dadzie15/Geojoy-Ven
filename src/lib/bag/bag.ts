import "server-only";
import { getCategoryTree, listProducts } from "@/lib/catalogue";
import type { Money, ProductCardData } from "@/lib/catalogue/types";
import { fromPesewas, toPesewas } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";
import { readBagItems, type BagItem } from "./cookie";
import type { Bag, BagLine } from "./types";

/** A variant with its product, as the bag needs it. */
export type BagVariant = {
  id: string;
  name: string;
  price: Money;
  stock: number;
  product: {
    id: string;
    slug: string;
    name: string;
    categoryId: string | null;
    image?: { src: string; alt: string };
    /** Number of models the product has. */
    variantCount: number;
  };
};

type VariantRow = {
  id: string;
  name: string;
  price: Money;
  stock: number;
  // The inner join only returns variants of products RLS lets us read: active ones.
  products: {
    id: string;
    slug: string;
    name: string;
    is_active: boolean;
    category_id: string | null;
    product_images: { url: string; alt: string; sort_order: number }[];
    product_variants: { count: number }[];
  };
};

/**
 * Variants of active products, read fresh (never cached) so prices and stock are current.
 * Unknown ids and variants of removed or inactive products are simply missing from the result.
 */
export async function getBagVariants(ids: string[]): Promise<Map<string, BagVariant>> {
  const variants = new Map<string, BagVariant>();
  if (ids.length === 0) return variants;

  const { data, error } = await createPublicClient({ fresh: true })
    .from("product_variants")
    .select(
      "id, name, price::text, stock, products!inner(id, slug, name, is_active, category_id, product_images(url, alt, sort_order), product_variants(count))",
    )
    .in("id", ids)
    .eq("products.is_active", true)
    .overrideTypes<VariantRow[], { merge: false }>();
  if (error) throw new Error(`Could not load the bag: ${error.message}`);

  for (const row of data) {
    const product = row.products;
    const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
    variants.set(row.id, {
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        categoryId: product.category_id,
        image: image ? { src: image.url, alt: image.alt || product.name } : undefined,
        variantCount: product.product_variants[0]?.count ?? 1,
      },
    });
  }
  return variants;
}

function toLine(variant: BagVariant, requested: number): BagLine {
  const quantity = Math.max(Math.min(requested, variant.stock), 0);
  const { product } = variant;
  return {
    variantId: variant.id,
    productId: product.id,
    href: `/product/${product.slug}`,
    name: product.name,
    model: product.variantCount === 1 && variant.name === "Standard" ? null : variant.name,
    image: product.image,
    unitPrice: variant.price,
    quantity,
    lineTotal: fromPesewas(toPesewas(variant.price) * quantity),
    stock: variant.stock,
    issue: variant.stock <= 0 ? "out_of_stock" : quantity < requested ? "reduced" : null,
  };
}

/** Lines for the items whose variant still exists, with count and subtotal worked out in pesewas. */
export function toBag(items: BagItem[], variants: Map<string, BagVariant>): Bag {
  const lines = items.flatMap(({ variantId, quantity }) => {
    const variant = variants.get(variantId);
    return variant ? [toLine(variant, quantity)] : [];
  });
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: fromPesewas(lines.reduce((sum, line) => sum + toPesewas(line.lineTotal), 0)),
  };
}

/**
 * The shopper's bag with current names, models, images and prices from the database. Lines whose
 * product was removed or deactivated are dropped; quantities above the stock are clamped and flagged.
 */
export async function getBag(): Promise<Bag> {
  const items = await readBagItems();
  return toBag(items, await getBagVariants(items.map((item) => item.variantId)));
}

const SUGGESTIONS = 2;

/** "Goes well with": popular products from the product's top-level category that are not in the bag. */
export async function getBagSuggestions(categoryId: string | null, bag: Bag): Promise<ProductCardData[]> {
  if (!categoryId) return [];
  const topLevel = (await getCategoryTree()).find(
    (top) => top.id === categoryId || top.children.some((child) => child.id === categoryId),
  );
  if (!topLevel) return [];

  const inBag = new Set(bag.lines.map((line) => line.productId));
  const { items } = await listProducts({
    category: topLevel.slug,
    sort: "popular",
    // Enough to find 2 even when every bag product is among the most popular.
    pageSize: inBag.size + SUGGESTIONS,
  });
  return items.filter((item) => !inBag.has(item.id)).slice(0, SUGGESTIONS);
}
