import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { MAX_BAG_LINES, MAX_LINE_QUANTITY } from "./types";

/**
 * The guest bag: an httpOnly cookie holding only `[{ variantId, quantity }]`. Prices, names and
 * totals are never stored; getBag() reads them from the database every time.
 *
 * PHASE 5: on sign-in, merge this cookie into the account's bag and clear it (see readBagItems).
 */
const BAG_COOKIE = "gjv_bag";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
// 50 lines of ~60 characters stay well under the 4 KB cookie limit; anything longer was not written by us.
const MAX_COOKIE_LENGTH = 4000;

export type BagItem = { variantId: string; quantity: number };

/** One cookie entry. Extra fields are dropped; a quantity above the cap is cut to it. */
const itemSchema = z.object({
  variantId: z.uuid(),
  quantity: z
    .number()
    .int()
    .min(1)
    .transform((quantity) => Math.min(quantity, MAX_LINE_QUANTITY)),
});

/**
 * Turns any cookie value into a valid list: bad JSON or a non-array is an empty bag, bad entries are
 * dropped one by one, repeated variants are merged, and the list is cut to MAX_BAG_LINES.
 */
export function parseBagCookie(value: string | undefined): BagItem[] {
  if (!value || value.length > MAX_COOKIE_LENGTH) return [];
  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const merged = new Map<string, number>();
  for (const entry of data) {
    const item = itemSchema.safeParse(entry);
    if (!item.success) continue;
    const { variantId, quantity } = item.data;
    merged.set(variantId, Math.min((merged.get(variantId) ?? 0) + quantity, MAX_LINE_QUANTITY));
  }
  return [...merged].slice(0, MAX_BAG_LINES).map(([variantId, quantity]) => ({ variantId, quantity }));
}

/** The bag cookie's items. Works anywhere on the server (read-only in Server Components). */
export async function readBagItems(): Promise<BagItem[]> {
  // PHASE 5: a signed-in shopper's bag will come from the database here, after merging this cookie.
  return parseBagCookie((await cookies()).get(BAG_COOKIE)?.value);
}

/** Saves the bag; an empty bag deletes the cookie. Server Actions and Route Handlers only. */
export async function writeBagItems(items: BagItem[]): Promise<void> {
  const store = await cookies();
  if (items.length === 0) {
    store.delete(BAG_COOKIE);
    return;
  }
  store.set(BAG_COOKIE, JSON.stringify(items.map(({ variantId, quantity }) => ({ variantId, quantity }))), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}
