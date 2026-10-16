import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { ProductCardData } from "@/lib/catalogue";
import {
  catalogueHref,
  clearedParams,
  countActiveFilters,
  type CatalogueParams,
} from "@/lib/catalogue/params";
import { LoadMore } from "./LoadMore";
import { ProductGrid } from "./ProductGrid";
import { SortSelect } from "./SortSelect";

type CatalogueResultsProps = {
  pathname: string;
  params: CatalogueParams;
  /** The first params.page × PAGE_STEP matching products. */
  products: ProductCardData[];
  total: number;
  /** The phone / tablet "Filter" button and sheet. */
  filterSheet: ReactNode;
};

const ITEM_ID = "product";

/** Results panel for a listing: count, sort, product grid, empty states and "Load more". */
export function CatalogueResults({ pathname, params, products, total, filterSheet }: CatalogueResultsProps) {
  const shown = products.length;
  const filtered = countActiveFilters(params) > 0;
  const nextHref =
    shown < total ? `${catalogueHref(pathname, params, { page: params.page + 1 })}#${ITEM_ID}-${shown + 1}` : null;

  return (
    <section
      aria-labelledby="results-title"
      className="flex min-w-0 flex-col gap-6 rounded-panel bg-card p-4 shadow-panel sm:p-6 lg:p-8"
    >
      <h2 id="results-title" className="sr-only">
        Products
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="lg:hidden">{filterSheet}</div>
        <p aria-live="polite" className="order-last w-full text-sm text-muted lg:order-none lg:w-auto">
          Showing {shown} of {total} {total === 1 ? "product" : "products"}
        </p>
        <SortSelect pathname={pathname} params={params} />
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="font-heading text-base font-semibold text-ink">
            {filtered ? "No products match these filters" : "No products here yet"}
          </p>
          {filtered && (
            <Button href={catalogueHref(pathname, clearedParams(params))} variant="secondary">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <ProductGrid products={products} itemIdPrefix={ITEM_ID} />
          <LoadMore shown={shown} total={total} href={nextHref} />
        </>
      )}
    </section>
  );
}
