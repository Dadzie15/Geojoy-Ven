"use client";

import type { ReactNode } from "react";
import { useAddToBag } from "@/components/product/add-to-bag";
import type { BagItemRef } from "@/lib/bag/types";

type CardAddButtonProps = {
  item: BagItemRef;
  name: string;
  /** Out of stock: the button is disabled. */
  disabled: boolean;
  className: string;
  /** The "+" box. */
  children: ReactNode;
};

/** A product card's "+" for single-model products: adds 1 to the bag and opens the drawer. */
export function CardAddButton({ item, name, disabled, className, children }: CardAddButtonProps) {
  const { add, pending, error } = useAddToBag();

  return (
    <>
      <button
        type="button"
        aria-label={`Add ${name} to bag`}
        aria-busy={pending || undefined}
        disabled={disabled || pending}
        onClick={(event) => add({ ...item, quantity: 1 }, event.currentTarget)}
        className={className}
      >
        {children}
      </button>
      {error && (
        // Under the card, in the gap before the next row.
        <p role="alert" className="absolute inset-x-0 top-full mt-1 text-xs text-terracotta">
          {error}
        </p>
      )}
    </>
  );
}
