"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { bagLink } from "@/lib/navigation";
import { useOptionalBag } from "./BagProvider";

type BagLinkProps = {
  /** A fixed count (the UI kit); the storefront shows the real bag. */
  count?: number;
  className?: string;
};

/** Header "Your bag" link with the item count; one link serves phones and desktops. */
export function BagLink({ count, className }: BagLinkProps) {
  const bag = useOptionalBag();
  const shown = count ?? bag?.count ?? 0;
  const label = `${bagLink.label}, ${shown} ${shown === 1 ? "item" : "items"}`;

  return (
    <Link href={bagLink.href} aria-label={label} className={cn("relative flex", className)}>
      <ShoppingCart className="size-6" {...iconProps} />
      {shown > 0 && (
        <span className="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 font-heading text-[0.6875rem] font-semibold text-field lg:static">
          {shown}
        </span>
      )}
      <span className="hidden flex-col leading-tight lg:flex">
        <span className="text-[0.8125rem] text-muted">{bagLink.label}</span>
        <span className="text-[0.8125rem] font-semibold">View bag</span>
      </span>
    </Link>
  );
}
