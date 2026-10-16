import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field, controlClasses, fieldMessageId, type FieldTextProps } from "./Field";
import { iconProps } from "./icon";

type SelectOption = { value: string; label: string };

type SelectProps = FieldTextProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
    id: string;
    label: string;
    options: SelectOption[];
    /** Shown as an empty first choice, e.g. "Choose a region". */
    placeholder?: string;
    hideLabel?: boolean;
  };

export function Select({
  id,
  label,
  options,
  placeholder,
  hideLabel,
  helper,
  error,
  className,
  ...rest
}: SelectProps) {
  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldMessageId(id, { helper, error })}
          className={cn(controlClasses(Boolean(error)), "cursor-pointer appearance-none rounded-input pr-10", className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          {...iconProps}
        />
      </div>
    </Field>
  );
}
