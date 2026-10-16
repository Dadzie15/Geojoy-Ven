import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { footerColumns, paymentMethods, type FooterLink } from "@/lib/navigation";
import { Container } from "./Container";

const linkClasses = "inline-flex min-h-11 items-center lg:min-h-8";

function FooterItem({ label, href, external }: FooterLink) {
  if (!href) return <span className={linkClasses}>{label}</span>;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${linkClasses} hover:text-field`}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={`${linkClasses} hover:text-field`}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-brown text-sand-tint max-sm:[body:has([data-whatsapp-button])_&]:pb-20 [&_*:focus-visible]:outline-field">
      <Container className="pt-12 pb-8 lg:pt-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" aria-label="GeoJoy Ventures home" className="inline-block rounded-input">
              <Logo tone="light" />
            </Link>
            <p className="mt-6 max-w-xs text-[0.8125rem] leading-relaxed">
              Kitchen appliances, cookware and household essentials for homes across Ghana. Pay securely with
              Mobile Money.
            </p>
            <h2 className="mt-6 text-sm font-semibold text-field">We accept</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <li key={method} className="rounded-chip border border-tan/50 px-2.5 py-1.5 text-[0.8125rem]">
                  {method}
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:flex lg:gap-20">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-base font-semibold text-field">{column.title}</h2>
                <ul className="mt-2 text-[0.8125rem] lg:mt-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterItem {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-12 border-t border-brown-light pt-8 text-center text-[0.8125rem] lg:mt-10">
          © {new Date().getFullYear()} GeoJoy Ventures. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
