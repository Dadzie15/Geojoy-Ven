"use client";

import { ChevronRight, MessageCircle, X } from "lucide-react";
import { useId, useRef, type RefObject } from "react";
import { useModal } from "@/hooks/useModal";
import { whatsappDisplayNumber, whatsappHours, whatsappUrl } from "@/lib/whatsapp";
import { Button } from "./Button";
import { iconProps } from "./icon";
import { LogoMark } from "./Logo";

type WhatsAppChatPanelProps = {
  id: string;
  topics: string[];
  message?: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function WhatsAppChatPanel({ id, topics, message, onClose, returnFocusRef }: WhatsAppChatPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModal({ open: true, onClose, containerRef: panelRef, returnFocusRef });

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-x-4 bottom-22 z-50 flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-panel bg-card shadow-panel sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-90 max-md:[body:has([data-sticky-buy-bar])_&]:bottom-40 max-md:[body:has([data-sticky-buy-bar])_&]:max-h-[calc(100dvh-12rem)]"
    >
      <div className="flex items-center gap-3 bg-brown py-2 pr-2 pl-4 text-field [&_*:focus-visible]:outline-field">
        <LogoMark tone="light" className="size-9" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-sm font-semibold">
            GeoJoy Ventures
          </h2>
          <p className="text-xs text-sand-tint">Online · usually replies within 1 hour</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="grid size-11 place-items-center rounded-full hover:bg-brown-light"
        >
          <X className="size-5" {...iconProps} />
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <div className="max-w-[85%] rounded-panel rounded-tl-chip bg-field p-3 text-sm text-ink">
          <p>Akwaaba! 👋 Welcome to GeoJoy Ventures. How can we help you today?</p>
          <p className="mt-1 text-xs text-muted">GeoJoy · now</p>
        </div>
        <p className="text-xs font-semibold text-muted">Choose a topic or type your own</p>
        <ul className="flex flex-col gap-2">
          {topics.map((topic) => (
            <li key={topic}>
              <a
                href={whatsappUrl(topic)}
                {...external}
                className="flex min-h-11 items-center justify-between gap-2 rounded-pill border border-line bg-field px-4 font-heading text-xs font-semibold text-ink transition-colors hover:border-brown motion-reduce:transition-none"
              >
                {topic}
                <ChevronRight className="size-4 shrink-0" {...iconProps} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-line p-4">
        <Button href={whatsappUrl(message)} {...external} variant="whatsapp" className="w-full">
          <MessageCircle className="size-4" {...iconProps} />
          Start chat on WhatsApp
        </Button>
        <p className="text-center text-xs text-muted">
          Opens WhatsApp · {whatsappDisplayNumber} · {whatsappHours}
        </p>
      </div>
    </div>
  );
}
