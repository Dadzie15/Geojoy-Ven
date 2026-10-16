"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Banner } from "@/lib/catalogue";
import { cn } from "@/lib/cn";

type HeroBannerProps = { banners: Banner[] };

/** This week's offer. Dots switch banners (no auto-play) and only show when there is more than one. */
export function HeroBanner({ banners }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const banner = banners[index];
  if (!banner) return null;

  return (
    <section
      aria-labelledby="hero-title"
      className="grid gap-4 rounded-panel bg-sand-tint p-4 shadow-panel sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.17fr)] lg:gap-6"
    >
      <div className="flex flex-col items-start justify-center px-2 py-4 sm:px-4 lg:py-6 lg:pr-0 lg:pl-8">
        <p className="text-[0.8125rem] font-semibold text-brown-light">This week only</p>
        <h1
          id="hero-title"
          className="mt-3 max-w-md text-[1.75rem] leading-tight font-bold text-ink sm:text-4xl lg:mt-5 lg:text-[2.75rem]"
        >
          {banner.title}
        </h1>
        {banner.subtitle && <p className="mt-3 max-w-md text-ink/80 lg:mt-4">{banner.subtitle}</p>}
        {banner.linkUrl && (
          <Button href={banner.linkUrl} className="mt-6 lg:mt-7">
            Shop now<span className="sr-only">: {banner.title}</span>
          </Button>
        )}
        {banners.length > 1 && (
          <div className="mt-4 -ml-3 flex lg:mt-6">
            {banners.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show offer ${i + 1} of ${banners.length}: ${item.title}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className="group grid h-11 min-w-11 place-items-center rounded-input"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-pill",
                    i === index ? "w-6 bg-brown" : "w-1.5 bg-tan group-hover:bg-brown-light",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative aspect-[7/4] overflow-hidden rounded-panel bg-image">
        {banner.imageUrl && (
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            priority={index === 0}
            sizes="(min-width: 1280px) 664px, (min-width: 1024px) 52vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}
