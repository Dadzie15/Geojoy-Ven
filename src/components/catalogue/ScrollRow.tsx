"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { iconProps } from "@/components/ui/icon";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/cn";

type ScrollRowProps = {
  /** Id for the h2, used to label the section and the list. */
  id: string;
  title: string;
  link: { href: string; label: string };
  /** The row's <li> items. */
  children: ReactNode;
};

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      aria-label={direction === 1 ? "Next products" : "Previous products"}
      // aria-disabled keeps the button focusable, so keyboard users can still find it.
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className="group grid size-11 place-items-center rounded-input"
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-input transition-colors motion-reduce:transition-none",
          disabled ? "border border-line bg-field text-ink" : "bg-brown text-field group-hover:bg-brown-light",
        )}
      >
        <Icon className="size-4" {...iconProps} />
      </span>
    </button>
  );
}

/** Section heading, "Shop now" link and a row that swipes on phones and scrolls with arrows from 768 px. */
export function ScrollRow({ id, title, link, children }: ScrollRowProps) {
  const { ref, atStart, atEnd, scrollPage } = useHorizontalScroll<HTMLUListElement>();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <h2 id={id} className="text-[1.375rem] font-bold text-ink md:text-[1.75rem]">
          {title}
        </h2>
        <Link
          href={link.href}
          className="inline-flex min-h-11 items-center gap-1 font-heading text-sm font-medium text-ink underline underline-offset-4 hover:text-brown-light"
        >
          {link.label}
          <span className="sr-only">: {title}</span>
          <ChevronRight className="size-4" {...iconProps} />
        </Link>
        <div className="-mr-1.5 hidden justify-end md:flex">
          <ArrowButton direction={-1} disabled={atStart} onClick={() => scrollPage(-1)} />
          <ArrowButton direction={1} disabled={atEnd} onClick={() => scrollPage(1)} />
        </div>
      </div>
      <ul
        ref={ref}
        aria-labelledby={id}
        // relative: contains absolutely positioned (sr-only) text, so off-screen items cannot widen the page.
        className="relative -m-1 flex snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto scroll-smooth p-1 [scrollbar-width:none] motion-reduce:scroll-auto md:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}

