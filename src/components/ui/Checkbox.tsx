import type { InputHTMLAttributes, ReactNode } from "react";
import { FieldMessage, fieldMessageId, type FieldTextProps } from "./Field";

type CheckboxProps = FieldTextProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
    id: string;
    /** Text, or text plus extras such as a count. */
    label: ReactNode;
  };

export function Checkbox({ id, label, helper, error, ...rest }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldMessageId(id, { helper, error })}
          className="size-5 shrink-0 cursor-pointer accent-brown disabled:cursor-not-allowed"
          {...rest}
        />
        {label}
      </label>
      <FieldMessage id={id} helper={helper} error={error} />
    </div>
  );
}
