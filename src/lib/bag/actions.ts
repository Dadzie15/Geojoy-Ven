"use server";

import { z } from "zod";
import { getBag, getBagSuggestions, getBagVariants, toBag } from "./bag";
import { readBagItems, writeBagItems, type BagItem } from "./cookie";
import { MAX_BAG_LINES, MAX_LINE_QUANTITY, type AddedToBag, type Bag, type BagResult } from "./types";

/**
 * Bag changes. Every input comes from the browser, so each is validated with zod and every variant is
 * re-read from the database: it must exist and belong to an active product, and quantities are clamped
 * to its stock. The browser never sends or decides a price.
 */

const quantity = z.number().int().min(1).max(MAX_LINE_QUANTITY);
const addSchema = z.object({ productId: z.uuid(), variantId: z.uuid(), quantity });
const updateSchema = z.object({ variantId: z.uuid(), quantity });
const removeSchema = z.object({ variantId: z.uuid() });

const INVALID = "Something went wrong. Please try again.";
const UNAVAILABLE = "This product is no longer available";

/** Writes the items and returns the bag they make, read fresh from the database. */
async function save(items: BagItem[]): Promise<Bag> {
  const variants = await getBagVariants(items.map((item) => item.variantId));
  // Lines that no longer exist are dropped and quantities clamped to the stock, so the cookie is repaired
  // too. Sold-out lines keep their quantity: they stay in the bag, flagged, until the shopper removes them.
  const kept = items.flatMap(({ variantId, quantity }) => {
    const stock = variants.get(variantId)?.stock;
    if (stock === undefined) return [];
    return [{ variantId, quantity: stock > 0 ? Math.min(quantity, stock) : quantity }];
  });
  await writeBagItems(kept);
  return toBag(kept, variants);
}

/** Adds a model to the bag (or to its quantity there), up to the stock. Returns what the drawer shows. */
export async function addToBag(input: unknown): Promise<BagResult<AddedToBag>> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };
  const { productId, variantId, quantity: wanted } = parsed.data;

  const [items, variants] = await Promise.all([readBagItems(), getBagVariants([variantId])]);
  const variant = variants.get(variantId);
  if (!variant || variant.product.id !== productId) return { ok: false, error: UNAVAILABLE };
  if (variant.stock <= 0) return { ok: false, error: "This model is out of stock" };

  const existing = items.find((item) => item.variantId === variantId);
  const current = Math.min(existing?.quantity ?? 0, variant.stock);
  if (current >= variant.stock) {
    return { ok: false, error: `Only ${variant.stock} in stock, and you already have them all in your bag` };
  }
  if (!existing && items.length >= MAX_BAG_LINES) {
    return { ok: false, error: `Your bag is full (${MAX_BAG_LINES} products). Remove something to add this.` };
  }

  const next = Math.min(current + wanted, variant.stock);
  const bag = await save(
    existing
      ? items.map((item) => (item.variantId === variantId ? { variantId, quantity: next } : item))
      : [...items, { variantId, quantity: next }],
  );
  const line = bag.lines.find((candidate) => candidate.variantId === variantId);
  if (!line) return { ok: false, error: UNAVAILABLE };

  return { ok: true, value: { bag, line, suggestions: await getBagSuggestions(variant.product.categoryId, bag) } };
}

/** Sets a line's quantity (clamped to the stock). For the Cart page. */
export async function updateBagItem(input: unknown): Promise<BagResult<Bag>> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };
  const { variantId, quantity: wanted } = parsed.data;

  const items = await readBagItems();
  if (!items.some((item) => item.variantId === variantId)) return { ok: false, error: UNAVAILABLE };
  const variant = (await getBagVariants([variantId])).get(variantId);
  if (!variant) return { ok: true, value: await save(items.filter((item) => item.variantId !== variantId)) };
  if (variant.stock <= 0) return { ok: false, error: "This model is out of stock" };

  const next = Math.min(wanted, variant.stock);
  return { ok: true, value: await save(items.map((item) => (item.variantId === variantId ? { variantId, quantity: next } : item))) };
}

/** Removes a line. For the Cart page. */
export async function removeFromBag(input: unknown): Promise<BagResult<Bag>> {
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };
  const items = await readBagItems();
  return { ok: true, value: await save(items.filter((item) => item.variantId !== parsed.data.variantId)) };
}

/**
 * Number of items in the bag, for the header. Read on the client after the page loads, so catalogue
 * pages stay static: the layout never reads the cookie.
 */
export async function getBagCount(): Promise<number> {
  return (await getBag()).count;
}
