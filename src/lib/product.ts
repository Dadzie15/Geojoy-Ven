import type { ProductVariant } from "@/lib/catalogue/types";
import { formatCedis, toPesewas } from "./format";
import { whatsappUrl } from "./whatsapp";

/** At or below this stock the badge shows how many are left ("In stock · 12 left"). */
export const LOW_STOCK_THRESHOLD = 15;

export function stockLabel(stock: number) {
  if (stock <= 0) return "Out of stock";
  return stock <= LOW_STOCK_THRESHOLD ? `In stock · ${stock} left` : "In stock";
}

/** The value kept in `?model=`: the variant's SKU, or its id when it has none. */
export function variantKey(variant: ProductVariant) {
  return variant.sku ?? variant.id;
}

/** The first in-stock variant, otherwise the first variant. */
export function defaultVariant(variants: ProductVariant[]) {
  return variants.find((variant) => variant.stock > 0) ?? variants[0];
}

/** Display-only line total ("₵400"). Phase 3 re-reads prices on the server; never trust this. */
export function formatLineTotal(price: string, quantity: number) {
  return formatCedis((toPesewas(price) * quantity) / 100);
}

type ProductMessage = {
  /** "Electric Kettle (Model C)", or just the name for single-model products. */
  label: string;
  /** Absolute page URL, including `?model=` when there are several models. */
  url: string;
};

export function askAboutProductUrl({ label, url }: ProductMessage) {
  return whatsappUrl(`Hi GeoJoy Ventures, I have a question about ${label}. ${url}`);
}

export function notifyWhenBackUrl({ label, url }: ProductMessage) {
  return whatsappUrl(`Hi GeoJoy Ventures, please tell me when ${label} is back in stock. ${url}`);
}
