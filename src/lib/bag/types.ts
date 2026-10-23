import type { ImageData } from "@/components/ui/Thumbnail";
import type { Money, ProductCardData } from "@/lib/catalogue/types";

/** Most lines a bag holds. */
export const MAX_BAG_LINES = 50;
/** Highest quantity read from the cookie or accepted from the browser; the stock clamps it further. */
export const MAX_LINE_QUANTITY = 999;

/** What a product page or card sends to add to the bag: ids and a quantity only, never a price. */
export type AddToBagInput = { productId: string; variantId: string; quantity: number };

/** The ids a single-model product card needs to add itself to the bag. */
export type BagItemRef = { productId: string; variantId: string };

export type BagLine = {
  variantId: string;
  productId: string;
  href: string;
  name: string;
  /** "Model C"; null for a product's only "Standard" model. */
  model: string | null;
  image?: ImageData;
  unitPrice: Money;
  /** Clamped to the current stock (0 when out of stock). */
  quantity: number;
  lineTotal: Money;
  stock: number;
  /** "reduced": the bag asked for more than is in stock; "out_of_stock": none left. */
  issue: "reduced" | "out_of_stock" | null;
};

export type Bag = {
  lines: BagLine[];
  /** Sum of the line quantities. */
  count: number;
  /** Items only: delivery is never charged online. */
  subtotal: Money;
};

/** What the "Added to your bag" drawer shows. */
export type AddedToBag = {
  bag: Bag;
  /** The bag line of the model just added. */
  line: BagLine;
  /** "Goes well with": up to 2 popular products from the same top-level category that are not in the bag. */
  suggestions: ProductCardData[];
};

export type BagResult<T> = { ok: true; value: T } | { ok: false; error: string };
