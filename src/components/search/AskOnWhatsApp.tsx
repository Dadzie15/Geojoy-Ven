import { Button } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/whatsapp";

/** WhatsApp link that asks whether the shop has the searched item. */
export function askOnWhatsAppHref(query: string) {
  return whatsappUrl(`Hi GeoJoy Ventures, I'm looking for ${query}. Do you have it?`);
}

/** "Ask on WhatsApp" button; opens WhatsApp in a new tab. */
export function AskOnWhatsAppButton({ query, className }: { query: string; className?: string }) {
  return (
    <Button
      href={askOnWhatsAppHref(query)}
      variant="whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Ask on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
    </Button>
  );
}

/** "Can't find what you need?" panel under the search results. */
export function AskOnWhatsAppPanel({ query }: { query: string }) {
  return (
    <section
      aria-labelledby="ask-on-whatsapp"
      className="flex flex-col gap-4 rounded-panel border border-line bg-card p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-8"
    >
      <div>
        <h2 id="ask-on-whatsapp" className="text-[1.375rem] font-bold text-ink">
          Can&apos;t find what you need?
        </h2>
        <p className="mt-2 max-w-xl text-muted">
          We stock more than what is online. Send us a photo or the name on WhatsApp and we will check for you.
        </p>
      </div>
      <AskOnWhatsAppButton query={query} className="shrink-0 max-md:w-full" />
    </section>
  );
}
