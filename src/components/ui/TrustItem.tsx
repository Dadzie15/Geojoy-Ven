import type { LucideIcon } from "lucide-react";
import { iconProps } from "./icon";

type TrustItemProps = { icon: LucideIcon; title: string; subtitle: string };

export function TrustItem({ icon: Icon, title, subtitle }: TrustItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-tint text-brown">
        <Icon className="size-5" {...iconProps} />
      </span>
      <span className="flex flex-col">
        <span className="font-heading text-sm font-semibold text-ink">{title}</span>
        <span className="text-xs text-muted">{subtitle}</span>
      </span>
    </div>
  );
}
