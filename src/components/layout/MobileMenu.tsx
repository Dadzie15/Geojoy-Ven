"use client";

import { ChevronDown, ChevronRight, Heart, Menu, Tag, User, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useId, useRef, useState, type MouseEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Logo } from "@/components/ui/Logo";
import { useModal } from "@/hooks/useModal";
import type { MenuCategory } from "@/lib/catalogue/types";
import { cn } from "@/lib/cn";
import { sentenceCase } from "@/lib/format";
import {
  aboutLink,
  accountLink,
  categoryHref,
  contactLink,
  dealsLink,
  savedLink,
  trackOrderLink,
} from "@/lib/navigation";

type MobileMenuProps = {
  /** "icon": hamburger button for phones. "categories": the brown "All categories" button (tablets). */
  trigger: "icon" | "categories";
  categories: MenuCategory[];
};

const rowClasses = "flex min-h-12 items-center gap-3 px-4 text-sm text-ink hover:bg-card";

/** Slide-out menu with categories (children in an accordion), account and help links. */
export function MobileMenu({ trigger, categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  /** Slug of the category whose children are shown. */
  const [expanded, setExpanded] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const categoriesHeadingId = useId();
  const close = useCallback(() => setOpen(false), []);
  useModal({ open, onClose: close, containerRef: panelRef, returnFocusRef: triggerRef });

  function closeOnLinkClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={trigger === "icon" ? "Open menu" : undefined}
        onClick={() => setOpen(true)}
        className={
          trigger === "icon"
            ? "grid size-11 place-items-center rounded-input text-ink"
            : buttonClasses({ className: "shrink-0 px-4" })
        }
      >
        <Menu className={trigger === "icon" ? "size-6" : "size-4"} {...iconProps} />
        {trigger === "categories" && "All categories"}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "visible" : "invisible transition-[visibility] duration-200 motion-reduce:transition-none",
        )}
      >
        <div
          aria-hidden="true"
          onClick={close}
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-menu-open={open || undefined}
          onClick={closeOnLinkClick}
          className={cn(
            "absolute inset-y-0 left-0 flex w-4/5 max-w-sm flex-col overflow-y-auto bg-background shadow-panel transition-transform duration-200 motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line py-3 pr-2 pl-4">
            <Link href="/" aria-label="GeoJoy Ventures home">
              <Logo />
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-input text-ink"
            >
              <X className="size-6" {...iconProps} />
            </button>
          </div>

          <ul className="border-b border-line py-2 md:hidden">
            <li>
              <Link href={accountLink.href} className={rowClasses}>
                <User className="size-5" {...iconProps} />
                Sign in / {accountLink.label}
              </Link>
            </li>
            <li>
              <Link href={savedLink.href} className={rowClasses}>
                <Heart className="size-5" {...iconProps} />
                {savedLink.label}
              </Link>
            </li>
          </ul>

          <nav aria-labelledby={categoriesHeadingId} className="border-b border-line py-2">
            <h2 id={categoriesHeadingId} className="px-4 pt-2 pb-1 text-xs font-semibold text-muted">
              Categories
            </h2>
            <ul>
              <li>
                <Link href={dealsLink.href} className={cn(rowClasses, "font-heading font-semibold text-terracotta")}>
                  <Tag className="size-4" {...iconProps} />
                  {dealsLink.label}
                </Link>
              </li>
              {categories.map((category) => {
                if (category.children.length === 0) {
                  return (
                    <li key={category.slug}>
                      <Link
                        href={categoryHref(category.slug)}
                        className={cn(rowClasses, "justify-between font-heading font-medium")}
                      >
                        {sentenceCase(category.name)}
                        <ChevronRight className="size-4 text-muted" {...iconProps} />
                      </Link>
                    </li>
                  );
                }

                const isExpanded = expanded === category.slug;
                const listId = `${panelId}-${category.slug}`;
                return (
                  <li key={category.slug}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={listId}
                      onClick={() => setExpanded(isExpanded ? null : category.slug)}
                      className={cn(rowClasses, "w-full justify-between text-left font-heading font-medium")}
                    >
                      {sentenceCase(category.name)}
                      <ChevronDown className={cn("size-4 text-muted", isExpanded && "rotate-180")} {...iconProps} />
                    </button>
                    <ul id={listId} hidden={!isExpanded} className="pb-2">
                      <li>
                        <Link href={categoryHref(category.slug)} className={cn(rowClasses, "pl-8 font-semibold")}>
                          View all {category.name.toLowerCase()}
                        </Link>
                      </li>
                      {category.children.map((child) => (
                        <li key={child.slug}>
                          <Link href={categoryHref(child.slug)} className={cn(rowClasses, "pl-8")}>
                            {sentenceCase(child.name)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ul className="py-2">
            {[trackOrderLink, aboutLink, contactLink].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={rowClasses}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
