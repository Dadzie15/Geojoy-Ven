import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { CategoryChips, type CategoryChip } from "@/components/catalogue/CategoryChips";
import { Pagination } from "@/components/catalogue/Pagination";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { SortSelect } from "@/components/catalogue/SortSelect";
import type { ProductList } from "@/lib/catalogue";
import { pageCount } from "@/lib/catalogue/listing";
import { catalogueHref, type CatalogueParams } from "@/lib/catalogue/params";

type PaginatedListingProps = {
  pathname: string;
  title: string;
  /** What the count line counts, e.g. { one: "deal", many: "deals" }. */
  noun: { one: string; many: string };
  /** Category pills; none hides the row. */
  chips: CategoryChip[];
  /** URL state with the page already clamped. */
  params: CatalogueParams;
  products: ProductList;
  /** Shown instead of the results panel when there are no products. */
  empty: ReactNode;
  /** Cards show a "Save ₵x" badge (Deals). */
  showSaving?: boolean;
};

/**
 * A listing with no filters sidebar (All products, Deals): breadcrumb, a header panel (title, count,
 * category pills, sort) and a results panel with a 5-column grid and numbered pagination.
 */
export function PaginatedListing({
  pathname,
  title,
  noun,
  chips,
  params,
  products,
  empty,
  showSaving,
}: PaginatedListingProps) {
  const first = (products.page - 1) * products.pageSize + 1;
  const last = first + products.items.length - 1;
  const word = products.total === 1 ? noun.one : noun.many;

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />

        <section
          aria-labelledby="page-title"
          className="grid gap-4 rounded-panel bg-card p-4 shadow-panel sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] lg:p-8"
        >
          <div>
            <h1 id="page-title" className="text-2xl font-semibold text-ink">
              {title}
            </h1>
            <p aria-live="polite" className="mt-2 text-[0.8125rem] text-muted">
              {products.items.length > 0 ? `Showing ${first}–${last} of ${products.total} ${word}` : `0 ${word}`}
            </p>
          </div>
          {chips.length > 0 && (
            <div className="min-w-0 md:col-span-2 md:row-start-2">
              <CategoryChips label="Shop by category" chips={chips} shape="pill" />
            </div>
          )}
          <div className="md:col-start-2 md:row-start-1">
            <SortSelect pathname={pathname} params={params} stretch />
          </div>
        </section>

        {products.items.length > 0 ? (
          <section
            aria-labelledby="results-title"
            className="flex flex-col gap-8 rounded-panel bg-card p-4 shadow-panel sm:p-6 lg:p-8"
          >
            <h2 id="results-title" className="sr-only">
              {title}
            </h2>
            <ProductGrid products={products.items} layout="five" showSaving={showSaving} />
            <Pagination
              page={products.page}
              pageCount={pageCount(products)}
              hrefFor={(page) => catalogueHref(pathname, params, { page })}
            />
          </section>
        ) : (
          empty
        )}
      </Container>
    </main>
  );
}
