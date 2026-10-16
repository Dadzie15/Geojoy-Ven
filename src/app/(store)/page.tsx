import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { generalTopics } from "@/lib/whatsapp";

// Placeholder home page. Replace it in build phase 2 (see docs/build-plan.md).
export default function HomePage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "233557843743";

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold text-terracotta">Coming soon</p>
        <h1 className="text-3xl text-brown sm:text-5xl">GeoJoy Ventures</h1>
        <p className="max-w-prose text-lg text-muted">
          Kitchen appliances, cookware and household essentials, delivered anywhere in Ghana.
          Pay securely with Mobile Money.
        </p>
        <div className="rounded-panel bg-card p-6 shadow-panel">
          <p className="font-heading font-semibold">Need something today?</p>
          <p className="mt-1 text-muted">Chat with us on WhatsApp, Monday to Friday, 9am to 7pm.</p>
          <a
            href={`https://wa.me/${whatsapp}`}
            className="mt-4 inline-flex min-h-11 items-center rounded-input bg-whatsapp px-5 font-heading font-bold text-ink"
          >
            Chat on WhatsApp
          </a>
        </div>
      </main>
      <WhatsAppButton topics={generalTopics} />
    </>
  );
}
