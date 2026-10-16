import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field, controlClasses, fieldMessageId, type FieldTextProps } from "./Field";

type InputProps = FieldTextProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "prefix"> & {
    id: string;
    label: string;
    hideLabel?: boolean;
    /** Fixed text before the value, e.g. "+233". */
    prefix?: string;
  };

export function Input({ id, label, hideLabel, helper, error, prefix, className, ...rest }: InputProps) {
  const control = (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={fieldMessageId(id, { helper, error })}
      className={cn(controlClasses(Boolean(error)), prefix ? "rounded-r-input" : "rounded-input", className)}
      {...rest}
    />
  );

  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error}>
      {prefix ? (
        <div className="flex">
          <span className="inline-flex shrink-0 items-center rounded-l-input border border-r-0 border-line bg-card px-3 text-sm text-muted">
            {prefix}
          </span>
          {control}
        </div>
      ) : (
        control
      )}
    </Field>
  );
}
