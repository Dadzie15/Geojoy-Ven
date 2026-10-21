import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { Container } from "@/components/layout/Container";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { TrustPanel } from "@/components/product/TrustPanel";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  getPopularProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  type ProductDetail,
  type ProductVariant,
} from "@/lib/catalogue";
import { categoryHref, deliveryLink } from "@/lib/navigation";
import { notFoundMetadata } from "@/lib/not-found";
import { variantKey } from "@/lib/product";
import { absoluteUrl } from "@/lib/site";
import { productTopics } from "@/lib/whatsapp";

// Static, refreshed hourly; admin changes refresh it sooner with revalidateTag("catalogue").
// The most popular products are built ahead; the rest render on first visit and are then cached.
export const revalidate = 3600;

const PRE_RENDERED_PRODUCTS = 24;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPopularProductSlugs(PRE_RENDERED_PRODUCTS)).map((slug) => ({ slug }));
}

const productPath = (slug: string) => `/product/${slug}`;

/** The first sentence, for the short description under the name; the full text is in the Description tab. */
function firstSentence(text: string) {
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFoundMetadata;

  const image = product.images[0];
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: productPath(slug) },
    openGraph: {
      type: "website",
      url: productPath(slug),
      title: product.name,
      description: product.description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

/** Product JSON-LD with one GHS offer per model. */
function productJsonLd(product: ProductDetail, variants: ProductVariant[]) {
  const url = absoluteUrl(productPath(product.slug));
  const offers = variants.map((variant) => ({
    "@type": "Offer",
    name: variant.name,
    sku: variant.sku ?? undefined,
    price: variant.price,
    priceCurrency: "GHS",
    availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: variants.length > 1 ? `${url}?model=${encodeURIComponent(variantKey(variant))}` : url,
  }));
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.length > 0 ? product.images.map((image) => image.url) : undefined,
    category: product.category?.name,
    url,
    offers: offers.length === 1 ? offers[0] : offers,
  };
  // Escape "<" so product text can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  // The design labels products with their top-level category ("Kitchen Appliances").
  const topCategory = product.parentCategory ?? product.category;
  // Every product should have a model; one without is shown at its base price and cannot be bought.
  const variants: ProductVariant[] =
    product.variants.length > 0
      ? product.variants
      : [{ id: product.id, name: product.name, price: product.price, stock: 0, sku: null }];

  const descriptionText = <p className="leading-relaxed whitespace-pre-line text-ink">{product.description}</p>;
  const tabs = [
    {
      key: "description",
      label: "Description",
      panel:
        product.specs.length > 0 ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
            {descriptionText}
            {/* Beside the description on desktop, as designed; phones use the Specifications tab. */}
            <div className="hidden lg:block">
              <ProductSpecs specs={product.specs} />
            </div>
          </div>
        ) : (
          descriptionText
        ),
    },
    ...(product.specs.length > 0
      ? [{ key: "specifications", label: "Specifications", panel: <ProductSpecs specs={product.specs} /> }]
      : []),
    {
      key: "delivery",
      label: "Delivery & returns",
      panel: (
        <div className="flex max-w-prose flex-col gap-3 leading-relaxed text-ink">
          <p>We deliver anywhere in Ghana.</p>
          <p>
            After you order, we book a rider and send your delivery fee by email and WhatsApp. You pay the fee to
            the rider when your order arrives.
          </p>
          <p>
            Unused items in their original packaging can be returned within 7 days. Refunds go to the Mobile Money
            number you paid with within 3 working days.
          </p>
          <p>
            <Link
              href={deliveryLink.href}
              className="inline-flex min-h-11 items-center font-semibold text-terracotta underline underline-offset-4 hover:text-brown"
            >
              Read more about delivery and returns
            </Link>
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <main className="pt-4 pb-16 lg:pt-6">
        <Container className="flex flex-col gap-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              ...(topCategory ? [{ label: topCategory.name, href: categoryHref(topCategory.slug) }] : []),
              { label: product.name },
            ]}
          />

          <Panel className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,11fr)_minmax(0,7fr)] lg:gap-16">
            <ProductGallery name={product.name} images={product.images} />
            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-col gap-2">
                {topCategory && <p className="text-xs font-semibold text-terracotta">{topCategory.name}</p>}
                <h1 className="text-2xl font-semibold text-ink">{product.name}</h1>
                <p className="text-muted">{firstSentence(product.description)}</p>
              </div>
              <ProductPurchase
                productId={product.id}
                name={product.name}
                variants={variants}
                pageUrl={absoluteUrl(productPath(product.slug))}
              />
              <TrustPanel />
            </div>
          </Panel>

          <Panel as="section" aria-label="Product details">
            <ProductDetailTabs label={`${product.name} details`} tabs={tabs} />
          </Panel>

          {related.length > 0 && topCategory && (
            <Panel as="section" aria-labelledby="related-products" className="flex flex-col gap-6">
              <SectionHeader
                id="related-products"
                eyebrow="You may also like"
                title={`More in ${topCategory.name}`}
                viewAllHref={categoryHref(topCategory.slug)}
              />
              <ProductGrid products={related} layout="four" />
            </Panel>
          )}
        </Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product, variants) }} />
      </main>
      <WhatsAppButton topics={productTopics} />
    </>
  );
}
