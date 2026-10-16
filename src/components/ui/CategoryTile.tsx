import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "./icon";
import { Thumbnail, type ImageData } from "./Thumbnail";

type CategoryTileProps = {
  href: string;
  name: string;
  image?: ImageData;
  /** "compact": small square image with the name centred below (Home "Shop by category"). */
  variant?: "default" | "compact";
};

export function CategoryTile({ href, name, image, variant = "default" }: CategoryTileProps) {
  if (variant === "compact") {
    return (
      <Link href={href} className="group flex flex-col items-center gap-2 rounded-input text-center">
        <span className="block w-full max-w-28 transition-opacity group-hover:opacity-85 motion-reduce:transition-none">
          <Thumbnail image={image} ratio="1/1" sizes="112px" />
        </span>
        <span className="font-heading text-xs font-semibold text-ink sm:text-[0.8125rem]">{name}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col gap-3">
      <Thumbnail image={image} />
      <span className="flex min-h-8 items-center justify-between gap-2 font-heading text-sm font-semibold text-ink">
        {name}
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-field transition-colors group-hover:bg-sand-tint motion-reduce:transition-none">
          <ChevronRight className="size-4" {...iconProps} />
        </span>
      </span>
    </Link>
  );
}
