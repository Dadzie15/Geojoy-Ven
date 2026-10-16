"use client";

import { ChevronRight, Heart, Menu, Tag, User, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useId, useRef, useState, type MouseEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Logo } from "@/components/ui/Logo";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/cn";
import {
  aboutLink,
  accountLink,
  categoryLinks,
  contactLink,
  dealsLink,
  savedLink,
  trackOrderLink,
} from "@/lib/navigation";

type MobileMenuProps = {
  /** "icon": hamburger button for phones. "categories": the brown "All categories" button. */
  trigger: "icon" | "categories";
};

const rowClasses = "flex min-h-12 items-center gap-3 px-4 text-sm text-ink hover:bg-card";

/** Slide-out menu with categories, account and help links. */
export function MobileMenu({ trigger }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
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
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={cn(rowClasses, "justify-between font-heading font-medium")}>
                    {link.label}
                    <ChevronRight className="size-4 text-muted" {...iconProps} />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={dealsLink.href} className={cn(rowClasses, "font-heading font-semibold text-terracotta")}>
                  <Tag className="size-4" {...iconProps} />
                  {dealsLink.label}
                </Link>
              </li>
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
