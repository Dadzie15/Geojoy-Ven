import { Minus, Plus } from "lucide-react";
import { iconProps } from "@/components/ui/icon";

type QuantityStepperProps = {
  value: number;
  /** The selected model's stock. 0 disables the stepper. */
  max: number;
  onChange: (value: number) => void;
};

const stepClasses =
  "grid size-11 place-items-center rounded-input text-ink transition-colors hover:bg-sand-tint disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent motion-reduce:transition-none";

/** − value + between 1 and the stock. */
export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  const disabled = max <= 0;
  return (
    <div role="group" aria-label="Quantity" className="flex h-11 shrink-0 items-center rounded-input border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={stepClasses}
      >
        <Minus className="size-4" {...iconProps} />
      </button>
      <span aria-live="polite" className={`w-6 text-center text-sm ${disabled ? "text-muted" : "text-ink"}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={stepClasses}
      >
        <Plus className="size-4" {...iconProps} />
      </button>
    </div>
  );
}
