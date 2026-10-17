import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { CategoryChips, type CategoryChip } from "@/components/catalogue/CategoryChips";
import { FilterSheet } from "@/components/catalogue/filters/FilterSheet";
import type { FilterOptions } from "@/components/catalogue/filters/FiltersForm";
import { Pagination } from "@/components/catalogue/Pagination";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { SortSelect } from "@/components/catalogue/SortSelect";
import { AskOnWhatsAppPanel } from "@/components/search/AskOnWhatsApp";
import { SearchField } from "@/components/search/SearchField";
import { SearchNoResults } from "@/components/search/SearchNoResults";
import { Button } from "@/components/ui/Button";
import {
  getCategoryTree,
  getPriceRange,
  getSearchCategories,
  listProducts,
  searchProducts,
  type SearchCategories,
} from "@/lib/catalogue";
import { countSearchProducts } from "@/lib/catalogue/actions";
import { loadClampedPage, pageCount, resolveSearchListing } from "@/lib/catalogue/listing";
import {
  catalogueHref,
  clearedParams,
  countActiveFilters,
  normaliseQuery,
  type RawSearchParams,
} from "@/lib/catalogue/params";
import { sentenceCase } from "@/lib/format";

type PageProps = { searchParams: Promise<RawSearchParams> };

const PATHNAME = "/search";
const MAX_RELATED = 5;
const RELATED_PRODUCTS = 3;
const TRY_COUNT = 4;
const POPULAR_COUNT = 5;

const searchHref = (q: string) => `${PATHNAME}?${new URLSearchParams({ q })}`;

/**
 * "Related:" chips: the top-level categories among the results, then up to 3 of the most popular
 * products in those categories that are not already results (as new searches); at most 5.
 */
async function relatedChips({ productIds, categories }: SearchCategories): Promise<CategoryChip[]> {
  const chips = categories.map((category) => ({
    label: sentenceCase(category.name),
    href: `/category/${category.slug}`,
    selected: false,
  }));
  if (categories.length === 0 || chips.length >= MAX_RELATED) return chips.slice(0, MAX_RELATED);

  const matched = new Set(productIds);
  const { items } = await listProducts({
    category: categories.map((category) => category.slug),
    sort: "popular",
    // Enough to find 3 that are not results even when every result is among the most popular.
    pageSize: matched.size + RELATED_PRODUCTS,
  });
  const names = items
    .filter((item) => !matched.has(item.id))
    .slice(0, RELATED_PRODUCTS)
    .map((item) => ({ label: sentenceCase(item.name), href: searchHref(item.name), selected: false }));

  return [...chips, ...names].slice(0, MAX_RELATED);
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = normaliseQuery((await searchParams).q);
  return {
    title: q ? `Search results for “${q}”` : "Search",
    description: q
      ? `Products matching “${q}” at GeoJoy Ventures: kitchen appliances, cookware and household goods delivered anywhere in Ghana.`
      : "Search kitchen appliances, cookware and household goods delivered anywhere in Ghana.",
    // Result pages are endless variations of the catalogue; keep them out of the index but follow their links.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const q = normaliseQuery(raw.q);
  if (!q) redirect("/products");

  const [tree, matches] = await Promise.all([getCategoryTree(), getSearchCategories(q)]);

  if (matches.total === 0) {
    const popular = await listProducts({ sort: "popular", pageSize: POPULAR_COUNT });
    const suggestions = popular.items.slice(0, TRY_COUNT).map((item) => ({
      label: sentenceCase(item.name),
      href: searchHref(item.name),
      selected: false,
    }));

    return (
      <main className="pt-4 pb-16 lg:pt-6">
        <Container className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search results" }]} />
          <SearchNoResults
            query={q}
            suggestions={suggestions}
            categories={tree.slice(0, 8).map((category) => ({ ...category, name: sentenceCase(category.name) }))}
            popular={popular.items}
          />
        </Container>
      </main>
    );
  }

  const { params: requested, options } = resolveSearchListing(q, raw, new Set(tree.map((category) => category.slug)));
  const [products, priceRange, related] = await Promise.all([
    loadClampedPage((page) => searchProducts(q, { ...options, page }), requested.page),
    getPriceRange({ q }),
    relatedChips(matches),
  ]);

  const params = { ...requested, page: products.page };
  const noun = products.total === 1 ? "product matches" : "products match";

  const filterOptions: FilterOptions = {
    types: matches.categories.map((category) => ({
      slug: category.slug,
      name: sentenceCase(category.name),
      count: category.count,
    })),
    typesTitle: "Category",
    // Whole-cedi bounds for the slider (display only; filtering uses the numeric column).
    priceBounds: priceRange
      ? { min: Math.floor(Number(priceRange.min)), max: Math.ceil(Number(priceRange.max)) }
      : null,
  };

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] md:items-center md:gap-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-ink [overflow-wrap:anywhere]">Results for “{q}”</h1>
            <p aria-live="polite" className="mt-2 text-muted">
              {products.total} {noun} your search
            </p>
          </div>
          <SearchField key={q} query={q} />
        </div>

        {related.length > 0 && (
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
            <span className="text-[0.8125rem] text-muted">Related:</span>
            <CategoryChips label="Related searches" chips={related} />
          </div>
        )}

        <section
          aria-labelledby="results-title"
          className="flex min-w-0 flex-col gap-6 rounded-panel bg-card p-4 shadow-panel sm:p-6 lg:p-8"
        >
          <h2 id="results-title" className="sr-only">
            Search results
          </h2>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <FilterSheet
              pathname={PATHNAME}
              params={params}
              total={products.total}
              countAction={countSearchProducts}
              {...filterOptions}
            />
            <SortSelect pathname={PATHNAME} params={params} />
          </div>

          {products.items.length > 0 ? (
            <>
              <ProductGrid products={products.items} layout="four" />
              <Pagination
                page={products.page}
                pageCount={pageCount(products)}
                hrefFor={(page) => catalogueHref(PATHNAME, params, { page })}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="font-heading text-base font-semibold text-ink">No products match these filters</p>
              {countActiveFilters(params) > 0 && (
                <Button href={catalogueHref(PATHNAME, clearedParams(params))} variant="secondary">
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </section>

        <AskOnWhatsAppPanel query={q} />
      </Container>
    </main>
  );
}
