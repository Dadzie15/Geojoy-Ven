"use client";

import { useRef } from "react";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { Button } from "@/components/ui/Button";

type CartCheckoutProps = {
  /** The formatted total from the server, e.g. "₵450". */
  total: string;
  /** Why checkout is not possible (a sold-out line); null when it is. */
  blockedReason: string | null;
};

const CHECKOUT_HREF = "/checkout";

/**
 * The summary's "Proceed to checkout", plus the phone sticky bar ("Total ₵X" · Checkout) that shows
 * whenever this button is out of view (on phones the summary is at the bottom of the page).
 */
export function CartCheckout({ total, blockedReason }: CartCheckoutProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const blocked = blockedReason !== null;

  return (
    <>
      <div ref={buttonRef} className="flex flex-col gap-2">
        {blocked ? (
          <Button disabled aria-describedby="checkout-blocked" className="w-full">
            Proceed to checkout
          </Button>
        ) : (
          <Button href={CHECKOUT_HREF} className="w-full">
            Proceed to checkout
          </Button>
        )}
        {blocked && (
          <p id="checkout-blocked" className="text-center text-sm text-terracotta">
            {blockedReason}
          </p>
        )}
      </div>

      <StickyBuyBar
        targetRef={buttonRef}
        showWhen="offscreen"
        title="Total"
        price={total}
        error={blockedReason}
        action={
          blocked ? (
            <Button disabled className="shrink-0">
              Checkout
            </Button>
          ) : (
            <Button href={CHECKOUT_HREF} className="shrink-0">
              Checkout
            </Button>
          )
        }
      />
    </>
  );
}
