"use client";

import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { iconProps } from "@/components/ui/icon";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/lib/catalogue/types";

const MAIN_SIZES = "(min-width: 1280px) 680px, (min-width: 768px) 50vw, 100vw";

type ProductGalleryProps = { name: string; images: ProductImage[] };

/**
 * One strip of full-width photos: swiped with dots on phones, driven by thumbnails from 768 px.
 * The shown photo is read from the scroll position, so swipes, dots and thumbnails always agree.
 */
export function ProductGallery({ name, images }: ProductGalleryProps) {
  const { ref, page } = useHorizontalScroll<HTMLUListElement>();
  const current = page - 1;

  if (images.length === 0) {
    return (
      <div role="img" aria-label={name} className="grid aspect-[9/8] place-items-center rounded-input bg-image text-muted">
        <ImageIcon className="size-10" {...iconProps} />
      </div>
    );
  }

  function show(index: number) {
    const strip = ref.current;
    if (strip) strip.scrollTo({ left: index * strip.clientWidth });
  }

  const showLabel = (index: number) => `Show image ${index + 1} of ${images.length}`;

  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-4">
      <ul
        ref={ref}
        aria-label={`${name} photos`}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-input bg-image [scrollbar-width:none] motion-reduce:scroll-auto md:overflow-hidden [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <li key={image.id} className="relative aspect-[9/8] w-full shrink-0 snap-start">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes={MAIN_SIZES}
              priority={index === 0}
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className="-my-2 flex justify-center md:hidden">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={showLabel(index)}
              aria-current={index === current}
              onClick={() => show(index)}
              className="grid size-11 place-items-center rounded-full"
            >
              <span className={cn("size-2 rounded-full", index === current ? "bg-brown" : "bg-line")} />
            </button>
          ))}
        </div>
      )}

      <div className="hidden flex-wrap gap-3 md:flex">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            aria-label={showLabel(index)}
            aria-current={index === current}
            onClick={() => show(index)}
            className={cn(
              "relative aspect-[9/7] w-32 overflow-hidden rounded-input bg-image",
              images.length > 1 && index === current && "ring-2 ring-brown",
            )}
          >
            <Image src={image.url} alt="" fill sizes="128px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
