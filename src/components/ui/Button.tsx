import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "light" | "clay" | "whatsapp";
export type ButtonSize = "default" | "small";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-input font-heading font-semibold transition-colors motion-reduce:transition-none disabled:pointer-events-none data-[preview=focus]:outline-2 data-[preview=focus]:outline-offset-2 data-[preview=focus]:outline-brown";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brown text-field hover:bg-brown-light data-[preview=hover]:bg-brown-light disabled:bg-tan",
  secondary:
    "border border-brown bg-field text-brown hover:bg-sand-tint data-[preview=hover]:bg-sand-tint disabled:border-line disabled:text-muted",
  light: "bg-sand-tint text-ink hover:bg-sand data-[preview=hover]:bg-sand disabled:bg-card disabled:text-muted",
  clay: "bg-terracotta text-field hover:bg-terracotta/85 data-[preview=hover]:bg-terracotta/85 disabled:bg-terracotta-tint",
  whatsapp:
    "bg-whatsapp text-ink hover:bg-whatsapp/85 data-[preview=hover]:bg-whatsapp/85 disabled:bg-whatsapp/40 disabled:text-ink/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-11 px-5 text-sm",
  small: "min-h-11 px-3 text-xs sm:min-h-9",
};

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

export function buttonClasses({ variant = "primary", size = "default", className }: StyleProps = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

type BaseProps = StyleProps & { children: ReactNode };
type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: never };
type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLink(props: ButtonProps): props is ButtonAsLink {
  return props.href !== undefined;
}

/** Renders a <button>, or a link styled as a button when `href` is given. */
export function Button(props: ButtonProps) {
  if (isLink(props)) {
    const { variant, size, className, ...rest } = props;
    return <Link className={buttonClasses({ variant, size, className })} {...rest} />;
  }
  const { variant, size, className, type = "button", ...rest } = props;
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}
