import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";

type StickyBuyBarProps = {
  /** The main buttons row; the bar shows once it has scrolled up out of view. */
  targetRef: RefObject<HTMLElement | null>;
  /** "Electric Kettle · Model C" */
  title: string;
  price: string;
  /** The bar's one button: Add to cart, or Notify me on WhatsApp. */
  action: ReactNode;
  /** Why the last add failed, shown under the bar's row (the main button's message is the announced one). */
  error?: string | null;
};

/**
 * Phones only (under 768 px): price and the main action fixed to the bottom. While shown it carries
 * `data-sticky-buy-bar`, which lifts the floating WhatsApp button above it and pads the page bottom.
 */
export function StickyBuyBar({ targetRef, title, price, action, error }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    // The root reaches far below the screen, so the buttons only stop "intersecting" once they are above it.
    // (Checking boundingClientRect instead misses a jump from below the fold straight past them.)
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "0px 0px 100000px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  return (
    <div
      data-sticky-buy-bar={visible || undefined}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-panel transition-transform motion-reduce:transition-none md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{title}</p>
          <p className="font-heading text-lg font-bold text-ink">{price}</p>
        </div>
        {action}
      </div>
      {error && <p className="mt-2 text-sm text-terracotta">{error}</p>}
    </div>
  );
}
