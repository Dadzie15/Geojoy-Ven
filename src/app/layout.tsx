import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GeoJoy Ventures | Kitchen and home essentials in Ghana",
    template: "%s | GeoJoy Ventures",
  },
  description:
    "Kitchen appliances, cookware and household essentials for homes across Ghana. Pay securely with Mobile Money.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#563324",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="min-h-dvh bg-background text-ink">{children}</body>
    </html>
  );
}
