import { whatsappUrl } from "./whatsapp";

export type NavLink = { label: string; href: string };

/** A category page. The categories themselves come from the database (getMenuCategories). */
export function categoryHref(slug: string) {
  return `/category/${slug}`;
}

export const dealsLink: NavLink = { label: "Deals of the week", href: "/deals" };
export const aboutLink: NavLink = { label: "About us", href: "/about" };
export const contactLink: NavLink = { label: "Contact us", href: "/help" };
export const trackOrderLink: NavLink = { label: "Track your order", href: "/track-order" };
export const accountLink: NavLink = { label: "My account", href: "/account" };
export const savedLink: NavLink = { label: "Saved items", href: "/saved" };
export const bagLink: NavLink = { label: "Your bag", href: "/cart" };
export const deliveryLink: NavLink = { label: "Delivery & fees", href: "/delivery-and-returns" };

/** A link without an href is shown as plain text until the client supplies it. */
export type FooterLink = { label: string; href?: string; external?: boolean };

export type FooterColumn = { title: string; links: FooterLink[] };

/** Footer columns after "Shop", which the Footer builds from the database categories. */
export const footerColumns: FooterColumn[] = [
  {
    title: "Help",
    links: [
      trackOrderLink,
      deliveryLink,
      { label: "Returns & refunds", href: `${deliveryLink.href}#returns` },
      { label: "FAQ", href: "/help#faq" },
      contactLink,
    ],
  },
  {
    title: "About",
    links: [
      aboutLink,
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { label: "Instagram" },
      { label: "Facebook" },
      { label: "TikTok" },
      { label: "WhatsApp", href: whatsappUrl(), external: true },
    ],
  },
];

export const paymentMethods = ["MTN MoMo", "Telecel Cash", "AirtelTigo Money"];
