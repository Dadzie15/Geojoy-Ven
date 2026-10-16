import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import { formatCedis } from "@/lib/format";
import { Badge, type BadgeTone } from "./Badge";
import { iconProps } from "./icon";
import { Thumbnail, type ImageData } from "./Thumbnail";

export type ProductCardProps = {
  href: string;
  name: string;
  category: string;
  price: number | string;
  oldPrice?: number | string;
  image?: ImageData;
  badge?: { label: string; tone: BadgeTone };
};

export function ProductCard({ href, name, category, price, oldPrice, image, badge }: ProductCardProps) {
  return (
    <article className="relative flex flex-col gap-3">
      <Thumbnail image={image}>
        {badge && (
          <Badge tone={badge.tone} className="absolute top-2 left-2">
            {badge.label}
          </Badge>
        )}
        <button
          type="button"
          aria-label={`Save ${name}`}
          className="group absolute top-0.5 right-0.5 z-10 grid size-11 place-items-center"
        >
          <span className="grid size-8 place-items-center rounded-full bg-field text-ink transition-colors group-hover:text-terracotta motion-reduce:transition-none">
            <Heart className="size-4" {...iconProps} />
          </span>
        </button>
      </Thumbnail>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted">{category}</p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-ink">
            <Link href={href} className="after:absolute after:inset-0 hover:text-brown-light">
              {name}
            </Link>
          </h3>
          <p className="font-heading text-base font-bold text-ink">{formatCedis(price)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          {oldPrice ? (
            <p className="text-xs text-muted">
              <span className="sr-only">Was </span>
              <s>{formatCedis(oldPrice)}</s>
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label={`Add ${name} to bag`}
            className="group relative z-10 -mr-1.5 grid size-11 place-items-center"
          >
            <span className="grid size-8 place-items-center rounded-input border border-ink/60 text-ink transition-colors group-hover:bg-sand-tint motion-reduce:transition-none">
              <Plus className="size-4" {...iconProps} />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
