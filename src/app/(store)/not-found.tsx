import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SearchForm } from "@/components/layout/SearchForm";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { listProducts } from "@/lib/catalogue";
import { dealsLink } from "@/lib/navigation";
import { notFoundMetadata } from "@/lib/not-found";

export const metadata: Metadata = notFoundMetadata;

const SUGGESTION_COUNT = 5;

/**
 * Storefront 404: unknown URLs (via the [...slug] catch-all) and notFound() from the Category and
 * Product pages. Renders inside the storefront layout; Next.js responds with status 404.
 */
export default async function NotFound() {
  const { items: popular } = await listProducts({ sort: "popular", pageSize: SUGGESTION_COUNT });

  return (
    <main className="pt-4 pb-16 lg:pt-6">
      <Container className="flex flex-col gap-6">
        <Panel
          as="section"
          aria-labelledby="page-title"
          className="flex flex-col items-center gap-4 py-12 text-center sm:py-16 lg:py-20"
        >
          {/* The status code is decoration; the heading says what happened. */}
          <p aria-hidden="true" className="font-heading text-7xl leading-none font-bold text-tan sm:text-8xl lg:text-[8.5rem]">
            404
          </p>
          <h1 id="page-title" className="mt-4 text-2xl font-semibold text-ink md:text-[1.75rem]">
            We can’t find that page
          </h1>
          <p className="max-w-lg text-muted">
            The link may be old or the product may no longer be available. Let’s get you back to shopping.
          </p>
          <SearchForm id="not-found-search" placeholder="Search for products..." className="w-full max-w-[32.5rem]" />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href="/" className="max-sm:w-full">
              Back to home
            </Button>
            <Button href={dealsLink.href} variant="secondary" className="max-sm:w-full">
              See deals
            </Button>
          </div>
        </Panel>

        {popular.length > 0 && (
          <Panel as="section" aria-labelledby="you-might-like" className="flex flex-col gap-6">
            <h2 id="you-might-like" className="text-[1.375rem] font-bold text-ink md:text-[1.75rem]">
              You might like
            </h2>
            <ProductGrid products={popular} layout="five" />
          </Panel>
        )}
      </Container>
    </main>
  );
}
