import { whatsappUrl } from "./whatsapp";

export type NavLink = { label: string; href: string };

type CategoryLink = NavLink & { hasSubmenu: boolean; inFooter: boolean };

function category(label: string, slug: string, hasSubmenu: boolean, inFooter: boolean): CategoryLink {
  return { label, href: `/category/${slug}`, hasSubmenu, inFooter };
}

export const categoryLinks: CategoryLink[] = [
  category("Kitchen Appliances", "kitchen-appliances", true, true),
  category("Cookware", "cookware", true, true),
  category("Storage", "storage", true, true),
  category("Laundry", "laundry", false, true),
  category("Cleaning", "cleaning", false, false),
  category("Bathroom", "bathroom", false, true),
  category("Mats", "mats", false, false),
  category("Furniture", "furniture", false, true),
];

export const dealsLink: NavLink = { label: "Deals of the week", href: "/deals" };
export const aboutLink: NavLink = { label: "About us", href: "/about" };
export const contactLink: NavLink = { label: "Contact us", href: "/help" };
export const trackOrderLink: NavLink = { label: "Track your order", href: "/track-order" };
export const accountLink: NavLink = { label: "My account", href: "/account" };
export const savedLink: NavLink = { label: "Saved items", href: "/saved" };
export const bagLink: NavLink = { label: "Your bag", href: "/cart" };

/** A link without an href is shown as plain text until the client supplies it. */
export type FooterLink = { label: string; href?: string; external?: boolean };

export const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: categoryLinks.filter((link) => link.inFooter),
  },
  {
    title: "Help",
    links: [
      trackOrderLink,
      { label: "Delivery & fees", href: "/delivery-and-returns" },
      { label: "Returns & refunds", href: "/delivery-and-returns#returns" },
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
