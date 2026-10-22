import type { Metadata } from "next";
import { PaginatedListing } from "@/components/catalogue/PaginatedListing";
import { Panel } from "@/components/ui/Panel";
import { getCategoryTree, listProducts } from "@/lib/catalogue";
import { loadClampedPage, resolveAllProductsListing } from "@/lib/catalogue/listing";
import { isRefinedView, type RawSearchParams } from "@/lib/catalogue/params";

type PageProps = { searchParams: Promise<RawSearchParams> };

const PATHNAME = "/products";
const TITLE = "All products";
const DESCRIPTION =
  "Every kitchen appliance, cookware set, storage, laundry, cleaning, bathroom, mat and furniture item we sell. Delivered anywhere in Ghana; pay with Mobile Money.";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { params } = resolveAllProductsListing(await searchParams);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PATHNAME },
    // Sorted views and pages after the first point search engines at the plain list.
    robots: isRefinedView(params) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: PATHNAME, title: TITLE, description: DESCRIPTION },
  };
}

export default async function AllProductsPage({ searchParams }: PageProps) {
  const { params: requested, options } = resolveAllProductsListing(await searchParams);
  const [products, tree] = await Promise.all([
    loadClampedPage((page) => listProducts({ ...options, page }), requested.page),
    getCategoryTree(),
  ]);

  const chips = [
    { label: "All", href: PATHNAME, selected: true },
    ...tree.slice(0, 8).map((category) => ({
      label: category.name,
      href: `/category/${category.slug}`,
      selected: false,
    })),
  ];

  return (
    <PaginatedListing
      pathname={PATHNAME}
      title={TITLE}
      noun={{ one: "product", many: "products" }}
      chips={chips}
      params={{ ...requested, page: products.page }}
      products={products}
      empty={
        <Panel as="section" className="p-4 sm:p-6 lg:p-8">
          <p className="py-12 text-center font-heading text-base font-semibold text-ink">No products here yet</p>
        </Panel>
      }
    />
  );
}
