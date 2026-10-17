"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { iconProps } from "./icon";
import { WhatsAppChatPanel } from "./WhatsAppChatPanel";

type WhatsAppButtonProps = {
  /** Quick topics shown in the chat panel; each opens WhatsApp with that text pre-filled. */
  topics: string[];
  /** Pre-filled text for "Start chat on WhatsApp". Leave empty for a blank chat. */
  message?: string;
};

/**
 * Floating WhatsApp chat. Render it only on Home, Product, Checkout, Payment failed, Track order and Help & contact.
 * Hidden while a header menu is open (`data-menu-open`), so it never shows over the menu, and moved up
 * on phones while the product page's sticky buy bar shows (`data-sticky-buy-bar`), so it never covers it.
 */
export function WhatsAppButton({ topics, message }: WhatsAppButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {open && (
        <WhatsAppChatPanel
          id={panelId}
          topics={topics}
          message={message}
          onClose={close}
          returnFocusRef={buttonRef}
        />
      )}
      <button
        ref={buttonRef}
        type="button"
        data-whatsapp-button
        aria-label="Chat with us on WhatsApp"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-ink shadow-panel transition-colors hover:bg-whatsapp/85 motion-reduce:transition-none sm:right-6 sm:bottom-6 max-md:[body:has([data-sticky-buy-bar])_&]:bottom-22 [body:has([data-menu-open])_&]:hidden"
      >
        <MessageCircle className="size-6" {...iconProps} />
      </button>
    </>
  );
}
