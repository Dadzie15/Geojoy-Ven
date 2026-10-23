"use client";

import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { formatCedis } from "@/lib/format";
import { savedLink } from "@/lib/navigation";
import {
  askAboutProductUrl,
  defaultVariant,
  formatLineTotal,
  notifyWhenBackUrl,
  variantKey,
} from "@/lib/product";
import type { ProductVariant } from "@/lib/catalogue/types";
import { useAddToBag } from "./add-to-bag";
import { ModelPicker } from "./ModelPicker";
import { QuantityStepper } from "./QuantityStepper";
import { StickyBuyBar } from "./StickyBuyBar";
import { StockBadge } from "./StockBadge";

export type ProductPurchaseProps = {
  productId: string;
  name: string;
  /** In sort order; at least one. */
  variants: ProductVariant[];
  /** Absolute product page URL without `?model=`, for WhatsApp messages. */
  pageUrl: string;
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Price, stock, model picker, quantity and buttons. The selected model lives in `?model=<sku>`:
 * the static HTML shows the default model (the Suspense fallback) and the URL's model takes over on hydration.
 */
export function ProductPurchase(props: ProductPurchaseProps) {
  return (
    <Suspense fallback={<PurchasePanel {...props} requestedModel={null} />}>
      <PurchaseFromUrl {...props} />
    </Suspense>
  );
}

function PurchaseFromUrl(props: ProductPurchaseProps) {
  return <PurchasePanel {...props} requestedModel={useSearchParams().get("model")} />;
}

function PurchasePanel({
  productId,
  name,
  variants,
  pageUrl,
  requestedModel,
}: ProductPurchaseProps & { requestedModel: string | null }) {
  const selected = variants.find((variant) => variantKey(variant) === requestedModel) ?? defaultVariant(variants);
  const [quantity, setQuantity] = useState(1);
  const actionsRef = useRef<HTMLDivElement>(null);
  const { add, pending, error, clearError } = useAddToBag();

  const hasModels = variants.length > 1;
  const soldOut = selected.stock <= 0;
  const message = {
    label: hasModels ? `${name} (${selected.name})` : name,
    url: hasModels ? `${pageUrl}?model=${encodeURIComponent(variantKey(selected))}` : pageUrl,
  };
  const total = formatLineTotal(selected.price, quantity);

  function selectModel(variant: ProductVariant) {
    setQuantity(1);
    clearError();
    const params = new URLSearchParams(window.location.search);
    params.set("model", variantKey(variant));
    // Next keeps useSearchParams in sync with history.replaceState: no navigation, no reload, no history entry.
    window.history.replaceState(null, "", `?${params}`);
  }

  function onAddToBag(event: MouseEvent<HTMLButtonElement>) {
    void add({ productId, variantId: selected.id, quantity }, event.currentTarget);
  }


  const notifyUrl = notifyWhenBackUrl(message);

  return (
    <div className="flex flex-col gap-6">
      <div aria-live="polite" aria-atomic="true" className="flex flex-wrap items-center gap-3">
        <p className="font-heading text-2xl font-bold text-ink">
          {formatCedis(selected.price)}
          {hasModels && <span className="sr-only"> for {selected.name}</span>}
        </p>
        <StockBadge stock={selected.stock} />
      </div>

      {hasModels && (
        <ModelPicker name={`model-${productId}`} variants={variants} selected={selected} onSelect={selectModel} />
      )}

      <div className="flex flex-col gap-4">
        {/* Under 1280 px the column is narrow: stepper and heart on one row, the full-width button below. */}
        <div ref={actionsRef} className="flex flex-wrap items-center gap-3">
          <QuantityStepper value={quantity} max={selected.stock} onChange={setQuantity} />
          <Button
            disabled={soldOut || pending}
            onClick={onAddToBag}
            className="order-last basis-full whitespace-nowrap xl:order-none xl:min-w-0 xl:flex-1 xl:basis-auto"
          >
            {soldOut ? "Out of stock" : pending ? "Adding…" : `Add to cart · ${total}`}
          </Button>
          <Link
            href={savedLink.href}
            aria-label={`Save ${name}`}
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:text-terracotta motion-reduce:transition-none xl:ml-0"
          >
            <Heart className="size-5" {...iconProps} />
          </Link>
        </div>
        {error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}
        <Button href={soldOut ? notifyUrl : askAboutProductUrl(message)} {...external} variant="secondary" className="w-full py-2 text-center">
          <MessageCircle className="size-4 shrink-0" {...iconProps} />
          {soldOut ? "Notify me on WhatsApp when it's back" : "Ask about this product on WhatsApp"}
        </Button>
      </div>

      <StickyBuyBar
        targetRef={actionsRef}
        title={hasModels ? `${name} · ${selected.name}` : name}
        price={soldOut ? formatCedis(selected.price) : total}
        error={error}
        action={
          soldOut ? (
            <Button href={notifyUrl} {...external} className="shrink-0">
              Notify me on WhatsApp
            </Button>
          ) : (
            <Button onClick={onAddToBag} disabled={pending} className="shrink-0">
              {pending ? "Adding…" : "Add to cart"}
            </Button>
          )
        }
      />
    </div>
  );
}
