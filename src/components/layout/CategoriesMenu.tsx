"use client";

import { ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { useModal } from "@/hooks/useModal";
import type { MenuCategory } from "@/lib/catalogue/types";
import { cn } from "@/lib/cn";
import { formatCedis, sentenceCase } from "@/lib/format";
import { categoryHref } from "@/lib/navigation";
import { Container } from "./Container";

// Visibility only transitions on close: at the start of a hidden-to-visible transition the panel
// is still hidden, and useModal could not move focus into it.
const fadeClasses = (open: boolean) =>
  cn(
    "duration-150 motion-reduce:transition-none",
    open ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]",
  );
const viewAllClasses = "text-sm text-terracotta underline underline-offset-2 hover:text-brown";

/**
 * Desktop "All categories" menu (1024 px and up): categories on the left, the active
 * category's children in the middle and a deal on the right, over a dimmed page.
 */
export function CategoriesMenu({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useModal({ open, onClose: close, containerRef: panelRef, returnFocusRef: triggerRef });

  // A click anywhere outside the panel closes it; the trigger toggles it itself.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, close]);

  function toggle() {
    if (!open) setActiveIndex(0);
    setOpen(!open);
  }

  function closeOnLinkClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) close();
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const last = categories.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "ArrowRight") {
      event.preventDefault();
      linksRef.current?.querySelector("a")?.focus();
      return;
    }
    if (next === null) return;
    event.preventDefault();
    rowRefs.current[next]?.focus();
  }

  function handleLinksKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft") return;
    event.preventDefault();
    rowRefs.current[activeIndex]?.focus();
  }

  const active = categories[activeIndex];
  if (!active) return null;
  const { deal } = active;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={buttonClasses({ className: "shrink-0 px-4" })}
      >
        <Menu className="size-4" {...iconProps} />
        All categories
      </button>

      <div
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-full z-45 h-screen bg-ink/40", fadeClasses(open))}
      />
      <Container className={cn("pointer-events-none absolute inset-x-0 top-full z-45 pt-2", fadeClasses(open))}>
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="All categories"
          onClick={closeOnLinkClick}
          className="pointer-events-auto flex overflow-hidden rounded-panel bg-card shadow-panel"
        >
          <ul className="w-70 shrink-0 bg-field px-3 py-4">
            {categories.map((category, index) => (
              <li key={category.slug}>
                <Link
                  ref={(element) => {
                    rowRefs.current[index] = element;
                  }}
                  href={categoryHref(category.slug)}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                  className={cn(
                    "flex min-h-12 items-center justify-between gap-3 rounded-input px-3.5 text-[0.9375rem] text-ink",
                    index === activeIndex && "bg-sand-tint",
                  )}
                >
                  {sentenceCase(category.name)}
                  <ChevronRight className="size-4" {...iconProps} />
                </Link>
              </li>
            ))}
          </ul>

          <div ref={linksRef} onKeyDown={handleLinksKeyDown} className="min-w-0 flex-1 px-8 py-7">
            <h2 className="text-base">{sentenceCase(active.name)}</h2>
            {active.children.length > 0 ? (
              <>
                <ul className={cn("mt-2 grid gap-x-8", active.children.length > 6 && "grid-cols-2")}>
                  {active.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={categoryHref(child.slug)}
                        className="inline-flex min-h-9 items-center text-[0.9375rem] text-muted hover:text-ink"
                      >
                        {sentenceCase(child.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={categoryHref(active.slug)}
                  className={cn(viewAllClasses, "mt-2 inline-flex min-h-9 items-center")}
                >
                  View all
                </Link>
              </>
            ) : (
              <Link
                href={categoryHref(active.slug)}
                className={cn(viewAllClasses, "mt-2 inline-flex min-h-9 items-center")}
              >
                View all {active.name.toLowerCase()}
              </Link>
            )}
          </div>

          {deal && (
            <div className="w-93 shrink-0 p-7 pl-0">
              <div className="flex h-full flex-col rounded-panel bg-sand p-6">
                <Thumbnail image={deal.image} sizes="300px" />
                <h2 className="mt-4 text-xl">{deal.name}</h2>
                <p className="mt-2 text-sm text-ink/75">
                  Save {formatCedis(deal.saving)} on the {deal.name}.
                </p>
                <Link href={deal.href} className={buttonClasses({ className: "mt-5 self-start" })}>
                  Shop the deal
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
