import { MessageCircleMore, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { TrustItem } from "@/components/ui/TrustItem";

const items = [
  { icon: Smartphone, title: "Secure Mobile Money payments", subtitle: "Protected by Paystack" },
  { icon: Truck, title: "Delivery across Ghana", subtitle: "Fee sent to you after you order" },
  { icon: ShieldCheck, title: "Quality checked", subtitle: "Every item tested before dispatch" },
  { icon: MessageCircleMore, title: "Help on WhatsApp", subtitle: "Mon–Fri, 9am – 7pm" },
];

export function TrustStrip() {
  return (
    <Panel as="section" aria-labelledby="trust-title" className="py-5 sm:py-5">
      <h2 id="trust-title" className="sr-only">
        Why shop with us
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5 lg:flex lg:justify-between">
        {items.map((item) => (
          <li key={item.title}>
            <TrustItem {...item} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
