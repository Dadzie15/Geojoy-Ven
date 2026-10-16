import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { iconProps } from "./icon";

export type ImageData = { src: string; alt: string };

export const GRID_IMAGE_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw";

export type ThumbnailRatio = "3/2" | "1/1" | "4/5";

const ratioClasses: Record<ThumbnailRatio, string> = {
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
};

type ThumbnailProps = { image?: ImageData; sizes?: string; ratio?: ThumbnailRatio; children?: ReactNode };

/** Image frame (3:2 by default) that shows a placeholder when there is no photo yet. */
export function Thumbnail({ image, sizes = GRID_IMAGE_SIZES, ratio = "3/2", children }: ThumbnailProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-input bg-image", ratioClasses[ratio])}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-muted">
          <ImageIcon className="size-8" {...iconProps} />
        </div>
      )}
      {children}
    </div>
  );
}
