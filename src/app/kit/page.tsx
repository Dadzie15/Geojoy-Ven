import { Smartphone, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { Panel } from "@/components/ui/Panel";
import { ProductCard, type ProductCardProps } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { TrustItem } from "@/components/ui/TrustItem";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { generalTopics } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "UI kit",
  description: "Shared components and states for the GeoJoy Ventures store.",
  robots: { index: false, follow: false },
};

const variants: ButtonVariant[] = ["primary", "secondary", "light", "clay", "whatsapp"];

const badges: { label: string; tone: BadgeTone }[] = [
  { label: "New", tone: "brand" },
  { label: "Deal", tone: "deal" },
  { label: "Popular", tone: "warning" },
  { label: "Paid", tone: "success" },
  { label: "Out of stock", tone: "neutral" },
];

const products: ProductCardProps[] = [
  {
    href: "/product/electric-kettle",
    name: "Electric Kettle 1.7L",
    category: "Kitchen Appliances",
    price: 170,
    oldPrice: 200,
    badge: { label: "Deal", tone: "deal" },
  },
  { href: "/product/blender", name: "Blender", category: "Kitchen Appliances", price: 500 },
  {
    href: "/product/4-in-1-blender",
    name: "4-in-1 Blender",
    category: "Kitchen Appliances",
    price: 550,
    badge: { label: "New", tone: "brand" },
  },
];

const regions = [
  { value: "greater-accra", label: "Greater Accra" },
  { value: "ashanti", label: "Ashanti" },
  { value: "central", label: "Central" },
];

function KitSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Panel as="section" aria-labelledby={id} className="flex flex-col gap-6">
      <h2 id={id} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </Panel>
  );
}

function StateLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs text-muted">{children}</p>;
}

/** Development-only review page. */
export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <Header bagCount={2} />
      <main id="main-content" className="py-10 sm:py-14">
        <Container className="flex flex-col gap-8">
          <h1 className="text-[1.375rem] font-bold md:text-[1.75rem]">UI kit</h1>

          <KitSection id="kit-buttons" title="Buttons">
            {variants.map((variant) => (
              <div key={variant}>
                <StateLabel>{variant}: default, hover, focus, disabled, small, link</StateLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={variant}>Button</Button>
                  <Button variant={variant} data-preview="hover">
                    Hover
                  </Button>
                  <Button variant={variant} data-preview="focus">
                    Focus
                  </Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                  <Button variant={variant} size="small">
                    Small
                  </Button>
                  <Button variant={variant} href="/kit#kit-buttons">
                    Link
                  </Button>
                </div>
              </div>
            ))}
          </KitSection>

          <KitSection id="kit-forms" title="Form fields">
            <div className="grid gap-6 md:grid-cols-2">
              <Input id="kit-name" label="Full name" placeholder="Ama Mensah" />
              <Input id="kit-focus" label="Focus" placeholder="Ama Mensah" data-preview="focus" />
              <Input
                id="kit-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                helper="We send your order confirmation here."
              />
              <Input
                id="kit-phone"
                label="Phone"
                type="tel"
                prefix="+233"
                defaultValue="24 123"
                error="Enter a 10-digit number starting 02 or 05."
              />
              <Select id="kit-region" label="Region" placeholder="Choose a region" options={regions} />
              <Select
                id="kit-region-error"
                label="Region"
                placeholder="Choose a region"
                options={regions}
                error="Choose your region."
              />
              <Input id="kit-disabled" label="Disabled" placeholder="Not editable" disabled />
              <div>
                <Checkbox id="kit-save" label="Save these details for next time" defaultChecked />
                <Checkbox id="kit-terms" label="I agree to the terms" error="Tick the box to continue." />
              </div>
            </div>
          </KitSection>

          <KitSection id="kit-badges" title="Badges">
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <Badge key={badge.label} tone={badge.tone}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </KitSection>

          <section aria-labelledby="kit-products" className="flex flex-col gap-6">
            <SectionHeader id="kit-products" eyebrow="Most loved" title="Bestsellers this month" viewAllHref="/kit" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.href} {...product} />
              ))}
            </div>
          </section>

          <KitSection id="kit-categories" title="Category tiles">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-5">
              {["Kitchen Appliances", "Cookware", "Storage"].map((name) => (
                <CategoryTile key={name} name={name} href="/kit#kit-categories" />
              ))}
            </div>
          </KitSection>

          <KitSection id="kit-trust" title="Trust items">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
              <TrustItem icon={Truck} title="Delivery across Ghana" subtitle="Within 24–48 hours" />
              <TrustItem icon={Smartphone} title="Pay with Mobile Money" subtitle="MTN, Telecel and AirtelTigo" />
            </div>
          </KitSection>

          <KitSection id="kit-logo" title="Logo">
            <div className="flex flex-wrap items-center gap-6">
              <Logo />
              <div className="rounded-panel bg-brown p-4">
                <Logo tone="light" />
              </div>
            </div>
          </KitSection>

          <KitSection id="kit-whatsapp" title="WhatsApp chat">
            <p className="text-sm text-muted">
              Use the green button at the bottom right to open the chat panel.
            </p>
          </KitSection>
        </Container>
      </main>
      <Footer />
      <WhatsAppButton topics={generalTopics} />
    </>
  );
}
