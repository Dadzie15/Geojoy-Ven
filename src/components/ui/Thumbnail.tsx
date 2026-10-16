import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { iconProps } from "./icon";

export type ImageData = { src: string; alt: string };

export const GRID_IMAGE_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw";

type ThumbnailProps = { image?: ImageData; sizes?: string; children?: ReactNode };

/** 3:2 image frame that shows a placeholder when there is no photo yet. */
export function Thumbnail({ image, sizes = GRID_IMAGE_SIZES, children }: ThumbnailProps) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-input bg-image">
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
