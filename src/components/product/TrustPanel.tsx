import { ShieldCheck, Smartphone, Truck } from "lucide-react";
import { iconProps } from "@/components/ui/icon";

const rows = [
  {
    icon: Truck,
    title: "Delivery across Ghana",
    text: "We send your delivery fee after you order. Pay the rider when it arrives.",
  },
  { icon: Smartphone, title: "Pay with Mobile Money", text: "MTN MoMo, Telecel Cash or AirtelTigo Money" },
  {
    icon: ShieldCheck,
    title: "Secure payment",
    text: "Payments protected by Paystack. We never see your MoMo PIN.",
  },
];

/** How delivery and payment work, beside the buy buttons. */
export function TrustPanel() {
  return (
    <ul className="rounded-panel border border-line px-5">
      {rows.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3 border-b border-line py-4 last:border-b-0">
          <Icon className="mt-0.5 size-5 shrink-0 text-brown" {...iconProps} />
          <div className="flex flex-col gap-1">
            <p className="font-heading text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
