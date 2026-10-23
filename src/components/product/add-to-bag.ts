"use client";

import { useCallback, useState } from "react";
import { useBag } from "@/components/bag/BagProvider";
import type { AddToBagInput } from "@/lib/bag/types";

export type { AddToBagInput };

/**
 * "Add to cart" / "+" / "Add" buttons: adds through the bag Server Action (ids and a quantity only; the
 * server re-reads price and stock) and opens the "Added to your bag" drawer. While it runs `pending`
 * is true; a refusal ("This model is out of stock") comes back as `error` and the drawer stays shut.
 */
export function useAddToBag() {
  const bag = useBag();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (input: AddToBagInput, opener: HTMLElement | null) => {
      setPending(true);
      setError(null);
      try {
        setError(await bag.add(input, opener));
      } catch {
        setError("Could not add to your bag. Check your connection and try again.");
      } finally {
        setPending(false);
      }
    },
    [bag],
  );

  const clearError = useCallback(() => setError(null), []);

  return { add, pending, error, clearError };
}
