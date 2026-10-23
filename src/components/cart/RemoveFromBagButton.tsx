"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useBag } from "@/components/bag/BagProvider";
import { iconProps } from "@/components/ui/icon";
import { removeFromBag } from "@/lib/bag/actions";

type RemoveFromBagButtonProps = {
  variantId: string;
  name: string;
  /** Id of the page heading; it takes focus once the line is gone. */
  focusAfterId: string;
};

/**
 * This button disappears with its line once the server's re-rendered page arrives (the empty state when it
 * was the last line). Waits for that, then moves focus to the page heading so it is not lost.
 */
function focusOnceGone(line: Element | null, headingId: string, triesLeft = 60) {
  if (line?.isConnected && triesLeft > 0) {
    setTimeout(() => focusOnceGone(line, headingId, triesLeft - 1), 50);
    return;
  }
  document.getElementById(headingId)?.focus();
}

/** "Remove" on a cart line. The page re-renders from the server without the line; the removal is announced. */
export function RemoveFromBagButton({ variantId, name, focusAfterId }: RemoveFromBagButtonProps) {
  const bag = useBag();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(button: HTMLElement) {
    const line = button.closest("li");
    setError(null);
    startTransition(async () => {
      try {
        const result = await removeFromBag({ variantId });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        bag.syncCount(result.value.count);
        bag.announce(`${name} removed from your bag`);
        focusOnceGone(line, focusAfterId);
      } catch {
        setError("Could not update your bag. Check your connection and try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={(event) => remove(event.currentTarget)}
        disabled={pending}
        aria-label={`Remove ${name}`}
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-input px-1 text-sm text-muted underline underline-offset-2 hover:text-ink disabled:opacity-60"
      >
        <Trash2 className="size-4" {...iconProps} />
        {pending ? "Removing…" : "Remove"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
