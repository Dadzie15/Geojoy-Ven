import type { Metadata } from "next";
import { PaginatedListing } from "@/components/catalogue/PaginatedListing";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { getCategoryTree, getDealCategories, listProducts } from "@/lib/catalogue";
import { loadClampedPage, resolveDealsListing } from "@/lib/catalogue/listing";
import { catalogueHref, isRefinedView, type RawSearchParams } from "@/lib/catalogue/params";
import { sentenceCase } from "@/lib/format";
import { dealsLink } from "@/lib/navigation";

type PageProps = { searchParams: Promise<RawSearchParams> };

const PATHNAME = dealsLink.href;
const TITLE = dealsLink.label;
const DESCRIPTION =
  "This week's offers on kitchen appliances, cookware and household goods, biggest savings first. Delivered anywhere in Ghana; pay with Mobile Money.";

/** Validated URL state; the category must be a top-level category. */
async function resolve(searchParams: PageProps["searchParams"]) {
  const [raw, tree] = await Promise.all([searchParams, getCategoryTree()]);
  return resolveDealsListing(raw, new Set(tree.map((category) => category.slug)));
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { params } = await resolve(searchParams);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PATHNAME },
    // Category, sorted and later pages point search engines at the plain list.
    robots: isRefinedView(params) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: PATHNAME, title: TITLE, description: DESCRIPTION },
  };
}

export default async function DealsPage({ searchParams }: PageProps) {
  const { params: requested, options } = await resolve(searchParams);
  const [products, categories] = await Promise.all([
    loadClampedPage((page) => listProducts({ ...options, page }), requested.page),
    getDealCategories(),
  ]);
  const params = { ...requested, page: products.page };

  // Pills filter the deals on this page; sort is kept, the page goes back to 1.
  const chips =
    categories.length > 0
      ? [
          { label: "All", href: catalogueHref(PATHNAME, params, { category: undefined }), selected: !params.category },
          ...categories.map((category) => ({
            label: sentenceCase(category.name),
            href: catalogueHref(PATHNAME, params, { category: category.slug }),
            selected: params.category === category.slug,
          })),
        ]
      : [];

  return (
    <PaginatedListing
      pathname={PATHNAME}
      title={TITLE}
      noun={{ one: "deal", many: "deals" }}
      chips={chips}
      params={params}
      products={products}
      showSaving
      empty={
        <Panel
          as="section"
          aria-labelledby="no-deals"
          className="flex flex-col items-center gap-4 text-center sm:py-14"
        >
          <h2 id="no-deals" className="text-2xl font-semibold text-ink">
            No deals right now
          </h2>
          <p className="max-w-xl text-muted">Check back soon, or browse everything we stock.</p>
          <Button href="/products" className="max-sm:w-full">
            Browse all products
          </Button>
        </Panel>
      }
    />
  );
}
