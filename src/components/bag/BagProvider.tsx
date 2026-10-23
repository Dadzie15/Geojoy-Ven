"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { addToBag, getBagCount } from "@/lib/bag/actions";
import type { AddToBagInput, AddedToBag } from "@/lib/bag/types";
import { BagDrawer } from "./BagDrawer";

type BagContextValue = {
  /** Items in the bag; null until it has been read. */
  count: number | null;
  /**
   * Adds to the bag on the server and opens the drawer. `opener` gets focus back when the drawer closes.
   * Resolves to an error message, or null on success.
   */
  add: (input: AddToBagInput, opener: HTMLElement | null) => Promise<string | null>;
};

const BagContext = createContext<BagContextValue | null>(null);

/** The bag count and "add" for storefront components; null outside the storefront (the UI kit). */
export function useOptionalBag() {
  return useContext(BagContext);
}

export function useBag() {
  const bag = useContext(BagContext);
  if (!bag) throw new Error("useBag needs a BagProvider (the storefront layout)");
  return bag;
}

/**
 * Bag state for the storefront: the header count and the "Added to your bag" drawer. The count is read
 * through a Server Action after the page loads, so the layout never reads the cookie and catalogue
 * pages stay static; after that every add returns the updated bag.
 */
export function BagProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  const [added, setAdded] = useState<AddedToBag | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  // Bumped by every add, so a slow first count never overwrites a newer one.
  const changes = useRef(0);

  useEffect(() => {
    const before = changes.current;
    getBagCount()
      .then((value) => {
        if (changes.current === before) setCount(value);
      })
      .catch(() => {
        // The count is a convenience; the bag itself is unaffected.
      });
  }, []);

  const add = useCallback(async (input: AddToBagInput, opener: HTMLElement | null) => {
    changes.current += 1;
    const result = await addToBag(input);
    if (!result.ok) return result.error;

    setCount(result.value.bag.count);
    setAdded(result.value);
    // Adding from inside the open drawer keeps the button that first opened it.
    if (!openRef.current) openerRef.current = opener;
    openRef.current = true;
    setOpen(true);
    return null;
  }, []);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  const value = useMemo(() => ({ count, add }), [count, add]);

  return (
    <BagContext.Provider value={value}>
      {children}
      <BagDrawer open={open} added={added} onClose={close} returnFocusRef={openerRef} />
    </BagContext.Provider>
  );
}
