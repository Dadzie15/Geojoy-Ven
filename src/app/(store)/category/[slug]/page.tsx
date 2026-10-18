import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { CatalogueResults } from "@/components/catalogue/CatalogueResults";
import { CategoryChips } from "@/components/catalogue/CategoryChips";
import { FilterSheet } from "@/components/catalogue/filters/FilterSheet";
import { FiltersSidebar } from "@/components/catalogue/filters/FiltersSidebar";
import type { FilterOptions } from "@/components/catalogue/filters/FiltersForm";
import { getCategoryBySlug, getPriceRange, listProducts, type CategoryDetail } from "@/lib/catalogue";
import { countCategoryProducts } from "@/lib/catalogue/actions";
import { resolveCategoryListing } from "@/lib/catalogue/listing";
import { isRefinedView, type RawSearchParams } from "@/lib/catalogue/params";
import { parseCatalogueParams } from "@/lib/catalogue/parse-params";
import { notFoundMetadata } from "@/lib/not-found";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const categoryPath = (slug: string) => `/category/${slug}`;
const productCount = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/** "Kettles, blenders & juicers, cookers & fryers and more. 10 products." or "Cookware, delivered anywhere in Ghana. 6 products." */
function describe(category: CategoryDetail): string {
  const names = category.children.map((child, index) => (index === 0 ? child.name : child.name.toLowerCase()));
  let lead: string;
  if (names.length > 3) lead = `${names.slice(0, 3).join(", ")} and more`;
  else if (names.length > 1) lead = `${names.slice(0, -1).join(", ")} and ${names.at(-1)!}`;
  else lead = `${category.name}, delivered anywhere in Ghana`;
  return `${lead}. ${productCount(category.productCount)}.`;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return notFoundMetadata;

  const description = describe(category);
  return {
    title: category.name,
    description,
    alternates: { canonical: categoryPath(slug) },
    // Filtered, sorted or paged views point search engines at the plain category page.
    robots: isRefinedView(parseCatalogueParams(await searchParams)) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: categoryPath(slug), title: category.name, description },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { params: listing, options } = resolveCategoryListing(category, await searchParams);
  const [products, priceRange, parent] = await Promise.all([
    listProducts(options),
    getPriceRange({ category: slug }),
    // Child pages show their siblings' chips; the tree is cached, so this is not another query.
    category.parent ? getCategoryBySlug(category.parent.slug) : category,
  ]);

  const pathname = categoryPath(slug);
  const chipsFor = parent ?? category;
  const chips =
    chipsFor.children.length > 0
      ? [
          { label: "All", href: categoryPath(chipsFor.slug), selected: chipsFor.id === category.id },
          ...chipsFor.children.map((child) => ({
            label: child.name,
            href: categoryPath(child.slug),
            selected: child.id === category.id,
          })),
        ]
      : null;

  const filterOptions: FilterOptions = {
    types: category.children
      .filter((child) => child.productCount > 0)
      .map((child) => ({ slug: child.slug, name: child.name, count: child.productCount })),
    // Whole-cedi bounds for the slider (display only; filtering uses the numeric column).
    priceBounds: priceRange
      ? { min: Math.floor(Number(priceRange.min)), max: Math.ceil(Number(priceRange.max)) }
      : null,
  };

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(category.parent ? [{ label: category.parent.name, href: categoryPath(category.parent.slug) }] : []),
            { label: category.name },
          ]}
        />
        <h1 className="mt-4 text-2xl font-semibold text-ink lg:mt-6">{category.name}</h1>
        <p className="mt-2 text-muted">{describe(category)}</p>
        {chips && (
          <div className="mt-6 lg:mt-8">
            <CategoryChips label={`${chipsFor.name} categories`} chips={chips} />
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
          <aside aria-label="Filters" className="hidden lg:block">
            <FiltersSidebar pathname={pathname} params={listing} {...filterOptions} />
          </aside>
          <CatalogueResults
            pathname={pathname}
            params={listing}
            products={products.items}
            total={products.total}
            filterSheet={
              <FilterSheet
                pathname={pathname}
                params={listing}
                total={products.total}
                countAction={countCategoryProducts.bind(null, slug)}
                {...filterOptions}
              />
            }
          />
        </div>
      </Container>
    </main>
  );
}
