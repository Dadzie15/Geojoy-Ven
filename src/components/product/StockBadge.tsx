import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { iconProps } from "@/components/ui/icon";
import { stockLabel } from "@/lib/product";

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge tone="soldOut" className="px-2.5 py-1">
        {stockLabel(stock)}
      </Badge>
    );
  }
  return (
    <Badge tone="success" className="gap-1 px-2.5 py-1">
      <Check className="size-3.5" {...iconProps} />
      {stockLabel(stock)}
    </Badge>
  );
}
