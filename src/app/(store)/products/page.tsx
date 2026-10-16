import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { CategoryChips } from "@/components/catalogue/CategoryChips";
import { Pagination } from "@/components/catalogue/Pagination";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { SortSelect } from "@/components/catalogue/SortSelect";
import { getCategoryTree, listProducts } from "@/lib/catalogue";
import { loadClampedPage, pageCount, resolveAllProductsListing } from "@/lib/catalogue/listing";
import { catalogueHref, isRefinedView, type RawSearchParams } from "@/lib/catalogue/params";

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

  const params = { ...requested, page: products.page };
  const pages = pageCount(products);
  const first = (products.page - 1) * products.pageSize + 1;
  const last = first + products.items.length - 1;
  const noun = products.total === 1 ? "product" : "products";

  const chips = [
    { label: "All", href: PATHNAME, selected: true },
    ...tree.slice(0, 8).map((category) => ({
      label: category.name,
      href: `/category/${category.slug}`,
      selected: false,
    })),
  ];

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: TITLE }]} />

        <section
          aria-labelledby="page-title"
          className="grid gap-4 rounded-panel bg-card p-4 shadow-panel sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] lg:p-8"
        >
          <div>
            <h1 id="page-title" className="text-2xl font-semibold text-ink">
              {TITLE}
            </h1>
            <p aria-live="polite" className="mt-2 text-[0.8125rem] text-muted">
              {products.items.length > 0
                ? `Showing ${first}–${last} of ${products.total} ${noun}`
                : `0 ${noun}`}
            </p>
          </div>
          <div className="min-w-0 md:col-span-2 md:row-start-2">
            <CategoryChips label="Shop by category" chips={chips} shape="pill" />
          </div>
          <div className="md:col-start-2 md:row-start-1">
            <SortSelect pathname={PATHNAME} params={params} stretch />
          </div>
        </section>

        <section
          aria-labelledby="results-title"
          className="flex flex-col gap-8 rounded-panel bg-card p-4 shadow-panel sm:p-6 lg:p-8"
        >
          <h2 id="results-title" className="sr-only">
            Products
          </h2>
          {products.items.length > 0 ? (
            <>
              <ProductGrid products={products.items} layout="five" />
              <Pagination
                page={products.page}
                pageCount={pages}
                hrefFor={(page) => catalogueHref(PATHNAME, params, { page })}
              />
            </>
          ) : (
            <p className="py-12 text-center font-heading text-base font-semibold text-ink">No products here yet</p>
          )}
        </section>
      </Container>
    </main>
  );
}
