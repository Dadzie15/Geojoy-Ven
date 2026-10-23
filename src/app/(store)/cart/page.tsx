import { ChevronLeft, ShieldCheck, ShoppingCart, Smartphone, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { CartCheckout } from "@/components/cart/CartCheckout";
import { CartQuantity } from "@/components/cart/CartQuantity";
import { RemoveFromBagButton } from "@/components/cart/RemoveFromBagButton";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { getBag } from "@/lib/bag/bag";
import type { Bag, BagLine } from "@/lib/bag/types";
import { listProducts } from "@/lib/catalogue";
import { formatCedis } from "@/lib/format";
import { dealsLink } from "@/lib/navigation";

// The bag is per shopper (cookie) and read fresh: never cache or pre-render this page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the items in your bag, change quantities and go to checkout.",
  robots: { index: false },
};

const TITLE_ID = "page-title";
const POPULAR_COUNT = 4;

const itemsLabel = (count: number) => `${count} ${count === 1 ? "item" : "items"}`;

export default async function CartPage() {
  const bag = await getBag();

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container className="flex flex-col gap-6">
        {bag.lines.length > 0 ? <FilledCart bag={bag} /> : <EmptyCart />}
      </Container>
    </main>
  );
}

function FilledCart({ bag }: { bag: Bag }) {
  const soldOut = bag.lines.some((line) => line.issue === "out_of_stock");

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 id={TITLE_ID} tabIndex={-1} className="flex flex-wrap items-baseline gap-x-4 text-2xl font-semibold text-ink">
        Your cart
        <span className="font-sans text-base font-normal text-muted">{itemsLabel(bag.count)}</span>
      </h1>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-9">
        <div className="flex min-w-0 flex-col gap-5">
          <p className="flex items-start gap-3 rounded-panel bg-sand-tint px-4 py-4 font-heading text-sm font-semibold text-ink sm:px-5">
            <Truck className="mt-0.5 size-5 shrink-0" {...iconProps} />
            Delivery anywhere in Ghana. Fee sent after you order · pay the rider on arrival.
          </p>

          <Panel as="section" aria-labelledby="cart-items" className="p-4 sm:p-6 lg:p-8">
            <h2 id="cart-items" className="sr-only">
              Items in your bag
            </h2>
            <div
              aria-hidden="true"
              className="hidden border-b border-line pb-4 font-heading text-[0.8125rem] font-semibold text-muted md:grid md:grid-cols-[minmax(0,1fr)_9rem_6rem] md:gap-6"
            >
              <span>Product</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
            </div>
            <ul className="divide-y divide-line">
              {bag.lines.map((line) => (
                <CartLine key={line.variantId} line={line} />
              ))}
            </ul>
          </Panel>

          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-2 self-start font-heading text-sm font-semibold text-ink hover:text-brown-light"
          >
            <ChevronLeft className="size-4" {...iconProps} />
            Continue shopping
          </Link>
        </div>

        <Panel as="section" aria-labelledby="order-summary" className="flex flex-col gap-5 p-6 lg:p-8">
          <h2 id="order-summary" className="font-heading text-lg font-semibold text-ink">
            Order summary
          </h2>
          <dl className="flex flex-col gap-4 border-b border-line pb-5 text-[0.9375rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Subtotal ({itemsLabel(bag.count)})</dt>
              <dd className="font-heading font-semibold text-ink">{formatCedis(bag.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Delivery fee</dt>
              <dd className="font-heading font-semibold text-ink">Sent after you order</dd>
            </div>
          </dl>
          {/* PROMO CODES: Phase 6. The field goes here once promo codes can be managed in the admin
              panel and are validated on the server; never apply a discount from the browser. */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-heading text-base font-semibold text-ink">Total</p>
            {/* The online total is items only: the delivery fee is paid to the rider. */}
            <p className="font-heading text-2xl font-bold text-ink">{formatCedis(bag.subtotal)}</p>
          </div>
          <CartCheckout
            total={formatCedis(bag.subtotal)}
            blockedReason={soldOut ? "Remove sold-out items to continue" : null}
          />
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-input bg-sand-tint px-3 py-1.5 font-heading text-[0.8125rem] font-semibold text-brown">
              <Smartphone className="size-4" {...iconProps} />
              Mobile Money
            </span>
            <p className="flex items-center gap-2 text-[0.8125rem] text-muted">
              <ShieldCheck className="size-4 shrink-0" {...iconProps} />
              Secure checkout · Payments by Paystack
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}

/** Phones: image left, details right, stepper and total on a row below. 768 px up: Product / Quantity / Total columns. */
function CartLine({ line }: { line: BagLine }) {
  const note =
    line.issue === "out_of_stock"
      ? "Sold out, please remove it to continue"
      : line.issue === "reduced"
        ? `Only ${line.stock} left, we updated your quantity`
        : null;

  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 md:grid-cols-[7rem_minmax(0,1fr)_9rem_6rem] md:items-center md:gap-x-6">
      <Link href={line.href} tabIndex={-1} aria-hidden="true" className="row-span-1 self-start md:self-center">
        <Thumbnail image={line.image} ratio="1/1" sizes="(min-width: 768px) 112px, 80px" />
      </Link>
      <div className="min-w-0">
        <h3 className="font-heading text-base font-semibold text-ink">
          {/* 44 px tall tap target; the negative margin keeps the line spacing of the design. */}
          <Link href={line.href} className="-my-3 inline-flex min-h-11 items-center hover:text-brown-light">
            {line.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">
          {line.model && `${line.model} · `}
          {formatCedis(line.unitPrice)} each
        </p>
        {note && (
          <p className="mt-2 rounded-input bg-warning-tint px-2 py-1 text-sm text-ink">{note}</p>
        )}
        <RemoveFromBagButton variantId={line.variantId} name={line.name} focusAfterId={TITLE_ID} />
      </div>
      <div className="col-span-2 flex items-start justify-between gap-4 md:contents">
        <CartQuantity variantId={line.variantId} name={line.name} quantity={line.quantity} stock={line.stock} />
        <p className="pt-2.5 text-right font-heading text-lg font-bold text-ink md:pt-0">
          <span className="sr-only">Total for {line.name}: </span>
          {formatCedis(line.lineTotal)}
        </p>
      </div>
    </li>
  );
}

async function EmptyCart() {
  const { items: popular } = await listProducts({ sort: "popular", pageSize: POPULAR_COUNT });

  return (
    <>
      <Panel
        as="section"
        aria-labelledby={TITLE_ID}
        className="mt-4 flex flex-col items-center gap-4 text-center sm:py-12 lg:mt-12"
      >
        <span aria-hidden="true" className="grid size-20 place-items-center rounded-full border border-line text-brown">
          <ShoppingCart className="size-8" {...iconProps} />
        </span>
        <h1 id={TITLE_ID} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Your bag is empty
        </h1>
        <p className="max-w-xl text-muted">Looks like you have not added anything yet. Start with our bestsellers.</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href="/products" className="max-sm:w-full">
            Start shopping
          </Button>
          <Button href={dealsLink.href} variant="secondary" className="max-sm:w-full">
            View deals
          </Button>
        </div>
      </Panel>

      {popular.length > 0 && (
        <Panel as="section" aria-labelledby="popular-right-now" className="flex flex-col gap-6">
          <SectionHeader id="popular-right-now" eyebrow="Top picks" title="Popular right now" />
          <ProductGrid products={popular} layout="four" />
        </Panel>
      )}
    </>
  );
}
