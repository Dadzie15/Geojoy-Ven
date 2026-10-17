import { formatCedis } from "@/lib/format";
import { variantKey } from "@/lib/product";
import type { ProductVariant } from "@/lib/catalogue/types";

type ModelPickerProps = {
  /** Radio group name, unique on the page. */
  name: string;
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
};

/** One tile per model, as native radios: arrow keys move and select, and each name reads "Model A, ₵150, in stock". */
export function ModelPicker({ name, variants, selected, onSelect }: ModelPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 font-heading text-sm font-semibold text-ink">
        Model: <span className="font-sans font-normal text-muted">{selected.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const soldOut = variant.stock <= 0;
          return (
            <label key={variant.id} className="group relative cursor-pointer">
              <input
                type="radio"
                name={name}
                value={variantKey(variant)}
                checked={variant.id === selected.id}
                onChange={() => onSelect(variant)}
                // Invisible but covering the tile, so clicks land on it and its focus ring outlines the tile.
                className="peer absolute inset-0 cursor-pointer appearance-none rounded-input"
              />
              <span className="flex min-h-14 min-w-22 flex-col justify-center rounded-input border border-line bg-field px-3 py-2 transition-colors peer-checked:border-brown peer-checked:bg-sand-tint peer-checked:ring-1 peer-checked:ring-brown peer-checked:ring-inset group-hover:border-brown motion-reduce:transition-none">
                <span className="font-heading text-xs font-semibold text-ink">{variant.name}</span>
                <span className="text-xs text-muted group-has-checked:text-ink">
                  <span className="sr-only">, </span>
                  {formatCedis(variant.price)}
                </span>
                {soldOut ? (
                  <span className="text-xs text-terracotta group-has-checked:text-ink">
                    <span className="sr-only">, </span>Out of stock
                  </span>
                ) : (
                  <span className="sr-only">, in stock</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
