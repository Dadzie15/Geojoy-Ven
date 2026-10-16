import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "./icon";
import { Thumbnail, type ImageData } from "./Thumbnail";

type CategoryTileProps = { href: string; name: string; image?: ImageData };

export function CategoryTile({ href, name, image }: CategoryTileProps) {
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
