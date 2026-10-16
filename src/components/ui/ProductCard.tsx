import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import { formatCedis } from "@/lib/format";
import { Badge, type BadgeTone } from "./Badge";
import { iconProps } from "./icon";
import { Thumbnail, type ImageData, type ThumbnailRatio } from "./Thumbnail";

export type ProductCardProps = {
  href: string;
  name: string;
  category: string;
  price: number | string;
  oldPrice?: number | string;
  image?: ImageData;
  badge?: { label: string; tone: BadgeTone };
  /** Variants have different prices: show "From ₵x". */
  priceFrom?: boolean;
  /** False shows an "Out of stock" badge. */
  inStock?: boolean;
  /** Shows the save (heart) button. Off until saved items arrive (Phase 5). */
  showSave?: boolean;
  /** "+" links to the product page to choose options, instead of adding to the bag. */
  chooseOptions?: boolean;
  imageRatio?: ThumbnailRatio;
  imageSizes?: string;
};

const plusClasses =
  "grid size-8 place-items-center rounded-input border border-ink/60 text-ink transition-colors group-hover:bg-sand-tint motion-reduce:transition-none";

export function ProductCard({
  href,
  name,
  category,
  price,
  oldPrice,
  image,
  badge,
  priceFrom = false,
  inStock = true,
  showSave = false,
  chooseOptions = false,
  imageRatio,
  imageSizes,
}: ProductCardProps) {
  const shownBadge = inStock ? badge : { label: "Out of stock", tone: "neutral" as const };

  return (
    // Full height of its grid or row cell, so the price row (and "+") lines up across a row.
    <article className="relative flex h-full flex-col gap-3">
      <Thumbnail image={image} ratio={imageRatio} sizes={imageSizes}>
        {shownBadge && (
          <Badge tone={shownBadge.tone} className="absolute top-2 left-2">
            {shownBadge.label}
          </Badge>
        )}
        {showSave && (
          <button
            type="button"
            aria-label={`Save ${name}`}
            className="group absolute top-0.5 right-0.5 z-10 grid size-11 place-items-center"
          >
            <span className="grid size-8 place-items-center rounded-full bg-field text-ink transition-colors group-hover:text-terracotta motion-reduce:transition-none">
              <Heart className="size-4" {...iconProps} />
            </span>
          </button>
        )}
      </Thumbnail>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs text-muted">{category}</p>
        <h3 className="text-sm font-medium text-ink">
          <Link href={href} className="after:absolute after:inset-0 hover:text-brown-light">
            {name}
          </Link>
        </h3>
        {/* Pinned to the bottom, so it lines up across a row however the name wraps. */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-base font-bold text-ink">
              {priceFrom && "From "}
              {formatCedis(price)}
            </p>
            {oldPrice ? (
              <p className="text-xs text-muted">
                <span className="sr-only">Was </span>
                <s>{formatCedis(oldPrice)}</s>
              </p>
            ) : null}
          </div>
          {chooseOptions ? (
            <Link
              href={href}
              aria-label={`Choose options for ${name}`}
              className="group relative z-10 -mr-1.5 -mb-1.5 grid size-11 place-items-center"
            >
              <span className={plusClasses}>
                <Plus className="size-4" {...iconProps} />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              aria-label={`Add ${name} to bag`}
              className="group relative z-10 -mr-1.5 -mb-1.5 grid size-11 place-items-center"
            >
              <span className={plusClasses}>
                <Plus className="size-4" {...iconProps} />
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
