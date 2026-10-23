"use client";

import { useEffect, useState, useTransition } from "react";
import { useBag } from "@/components/bag/BagProvider";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { updateBagItem } from "@/lib/bag/actions";

type CartQuantityProps = {
  variantId: string;
  name: string;
  /** The quantity the server has (already clamped to stock). */
  quantity: number;
  stock: number;
};

/**
 * A cart line's stepper (1 to stock). Each change is saved with `updateBagItem`; the action sets the bag
 * cookie, so Next.js re-renders the page on the server and totals arrive from there. While saving, the
 * stepper shows the requested number; on error it goes back to the server's and shows why.
 */
export function CartQuantity({ variantId, name, quantity, stock }: CartQuantityProps) {
  const bag = useBag();
  const [shown, setShown] = useState(quantity);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The server's quantity wins whenever it changes (saved, clamped or restored).
  useEffect(() => setShown(quantity), [quantity]);

  function change(next: number) {
    setShown(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateBagItem({ variantId, quantity: next });
        if (result.ok) {
          bag.syncCount(result.value.count);
        } else {
          setShown(quantity);
          setError(result.error);
        }
      } catch {
        setShown(quantity);
        setError("Could not update your bag. Check your connection and try again.");
      }
    });
  }

  return (
    <div aria-busy={pending || undefined} className="flex flex-col gap-1">
      <QuantityStepper
        value={shown}
        max={stock}
        onChange={change}
        label={`Quantity of ${name}`}
        disabled={pending}
      />
      {error && (
        <p role="alert" className="max-w-56 text-sm text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
