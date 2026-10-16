import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { iconProps } from "./icon";

export type FieldTextProps = { helper?: string; error?: string };

export function fieldMessageId(id: string, { helper, error }: FieldTextProps) {
  if (error) return `${id}-error`;
  if (helper) return `${id}-helper`;
  return undefined;
}

export function controlClasses(invalid: boolean) {
  return cn(
    "min-h-11 w-full border bg-field px-3 text-sm text-ink placeholder:text-muted focus:border-brown data-[preview=focus]:border-brown data-[preview=focus]:outline-2 data-[preview=focus]:outline-offset-2 data-[preview=focus]:outline-brown disabled:cursor-not-allowed disabled:bg-card disabled:text-muted",
    invalid ? "border-terracotta" : "border-line",
  );
}

/** Error (terracotta, with icon) or helper text under a form control. */
export function FieldMessage({ id, helper, error }: FieldTextProps & { id: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-terracotta">
        <CircleAlert className="mt-0.5 size-4 shrink-0" {...iconProps} />
        {error}
      </p>
    );
  }
  if (helper) {
    return (
      <p id={`${id}-helper`} className="text-sm text-muted">
        {helper}
      </p>
    );
  }
  return null;
}

type FieldProps = FieldTextProps & {
  id: string;
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
};

export function Field({ id, label, hideLabel, helper, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn("font-heading text-sm font-semibold text-ink", hideLabel && "sr-only")}
      >
        {label}
      </label>
      {children}
      <FieldMessage id={id} helper={helper} error={error} />
    </div>
  );
}
