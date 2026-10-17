/**
 * What the product page sends when a shopper adds to the bag. Ids and a quantity only:
 * the bag re-reads the price and stock on the server.
 */
export type AddToBagInput = { productId: string; variantId: string; quantity: number };

/**
 * PHASE 3: the single place the product page's "Add to cart" buttons (main button and
 * phone sticky bar) call. Replace this body with the bag server action (cookie bag for
 * guests, merged on sign-in) and open the added-to-bag drawer (D33).
 */
export function addToBag(input: AddToBagInput): void {
  void input;
}
