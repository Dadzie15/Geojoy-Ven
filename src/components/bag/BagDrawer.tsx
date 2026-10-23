"use client";

import { Check, ShieldCheck, Truck, X } from "lucide-react";
import { useEffect, useId, useRef, type MouseEvent, type RefObject } from "react";
import { useAddToBag } from "@/components/product/add-to-bag";
import { Button } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { useModal } from "@/hooks/useModal";
import type { AddedToBag } from "@/lib/bag/types";
import type { ProductCardData } from "@/lib/catalogue/types";
import { cn } from "@/lib/cn";
import { formatCedis } from "@/lib/format";
import { bagLink } from "@/lib/navigation";

type BagDrawerProps = {
  open: boolean;
  /** The last add; kept while the drawer slides out. */
  added: AddedToBag | null;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

const CHECKOUT_HREF = "/checkout";

/**
 * "Added to your bag" (D33): slides in from the right (full width on phones) over a dimmed page.
 * Closes with ✕, Escape, the overlay, "Continue shopping" or any link; focus is trapped while open and
 * returns to the button that opened it. `data-menu-open` hides the floating WhatsApp button meanwhile.
 */
export function BagDrawer({ open, added, onClose, returnFocusRef }: BagDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useModal({ open, onClose, containerRef: panelRef, returnFocusRef });

  // Adding from "Goes well with" redraws the list and removes the button that had focus: keep focus inside.
  useEffect(() => {
    if (open && !panelRef.current?.contains(document.activeElement)) closeRef.current?.focus();
  }, [open, added]);

  function closeOnLinkClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) onClose();
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "visible" : "invisible transition-[visibility] duration-200 motion-reduce:transition-none",
      )}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-menu-open={open || undefined}
        inert={!open}
        onClick={closeOnLinkClick}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-card shadow-panel transition-transform duration-200 motion-reduce:transition-none sm:w-[27.5rem]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line py-3 pr-3 pl-4 sm:pl-7">
          <h2 id={titleId} className="flex items-center gap-3 font-heading text-lg font-semibold text-ink">
            <span className="grid size-7 place-items-center rounded-full bg-brown text-field">
              <Check className="size-4" {...iconProps} />
            </span>
            Added to your bag
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-input text-muted hover:text-ink"
          >
            <X className="size-5" {...iconProps} />
          </button>
        </div>

        {added && (
          <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
            <AddedLine added={added} />

            <dl className="flex flex-col gap-3 rounded-input bg-field p-4">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-heading text-sm font-semibold text-ink">
                  Bag subtotal ({added.bag.count} {added.bag.count === 1 ? "item" : "items"})
                </dt>
                <dd className="font-heading text-lg font-bold text-ink">{formatCedis(added.bag.subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 text-sm text-muted">
                <dt>Delivery</dt>
                <dd>Sent after you order</dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-sm text-ink">
              <Truck className="mt-0.5 size-4 shrink-0 text-terracotta" {...iconProps} />
              Delivery anywhere in Ghana · we’ll send the fee after you order
            </p>

            <div className="flex flex-col items-center gap-3">
              <Button href={CHECKOUT_HREF} className="w-full">
                Checkout
              </Button>
              <Button href={bagLink.href} variant="secondary" className="w-full">
                View bag
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 px-2 font-heading text-sm font-semibold text-terracotta underline underline-offset-2 hover:text-brown"
              >
                Continue shopping
              </button>
            </div>

            {added.suggestions.length > 0 && (
              <section aria-labelledby={`${titleId}-more`} className="flex flex-col gap-4 border-t border-line pt-6">
                <h3 id={`${titleId}-more`} className="font-heading text-base font-semibold text-ink">
                  Goes well with
                </h3>
                <ul className="flex flex-col gap-4">
                  {added.suggestions.map((product) => (
                    <Suggestion key={product.id} product={product} />
                  ))}
                </ul>
              </section>
            )}

            <p className="flex items-center gap-2 text-sm text-muted">
              <ShieldCheck className="size-4 shrink-0" {...iconProps} />
              Pay securely with Mobile Money
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddedLine({ added: { line } }: { added: AddedToBag }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 shrink-0">
        <Thumbnail image={line.image} ratio="1/1" sizes="80px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-base font-semibold text-ink">{line.name}</p>
        <p className="mt-1 text-sm text-muted">
          {line.model && `${line.model} · `}Qty {line.quantity}
        </p>
      </div>
      <p className="font-heading text-lg font-bold text-ink">{formatCedis(line.lineTotal)}</p>
    </div>
  );
}

/** A "Goes well with" row: one model adds straight to the bag (and refreshes the drawer); several link to the product. */
function Suggestion({ product }: { product: ProductCardData }) {
  const { add, pending, error } = useAddToBag();
  const { bagItem } = product;

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <div className="w-14 shrink-0">
          <Thumbnail image={product.image} ratio="1/1" sizes="56px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-ink">{product.name}</p>
          <p className="text-sm text-muted">
            {product.priceFrom && "From "}
            {formatCedis(product.price)}
          </p>
        </div>
        {bagItem ? (
          <Button
            variant="secondary"
            disabled={pending || !product.inStock}
            aria-label={`Add ${product.name} to bag`}
            onClick={(event) => add({ ...bagItem, quantity: 1 }, event.currentTarget)}
            className="shrink-0"
          >
            {pending ? "Adding…" : product.inStock ? "Add" : "Out of stock"}
          </Button>
        ) : (
          <Button href={product.href} variant="secondary" aria-label={`View ${product.name}`} className="shrink-0">
            View
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
    </li>
  );
}
