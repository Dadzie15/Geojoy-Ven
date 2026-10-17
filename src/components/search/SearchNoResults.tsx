import { Search } from "lucide-react";
import { CategoryChips, type CategoryChip } from "@/components/catalogue/CategoryChips";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { Button } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { Panel } from "@/components/ui/Panel";
import type { CategoryNode, ProductCardData } from "@/lib/catalogue";
import { AskOnWhatsAppButton } from "./AskOnWhatsApp";

type SearchNoResultsProps = {
  query: string;
  /** "Try:" chips: popular product names as new searches. */
  suggestions: CategoryChip[];
  categories: CategoryNode[];
  popular: ProductCardData[];
};

/** Search with no matches: suggestions, "Browse all products", WhatsApp, categories and popular products. */
export function SearchNoResults({ query, suggestions, categories, popular }: SearchNoResultsProps) {
  return (
    <>
      <Panel as="section" aria-labelledby="page-title" className="flex flex-col items-center gap-4 text-center sm:py-14">
        <span aria-hidden="true" className="grid size-20 place-items-center rounded-full bg-sand-tint text-brown">
          <Search className="size-8" {...iconProps} />
        </span>
        <h1 id="page-title" className="text-2xl font-semibold text-ink [overflow-wrap:anywhere] md:text-[1.75rem]">
          No results for “{query}”
        </h1>
        <p className="max-w-xl text-muted">
          Check the spelling, try a more general word, or browse a category below. You can also ask us on WhatsApp if
          we stock it.
        </p>
        {suggestions.length > 0 && (
          <div className="flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-center lg:gap-3">
            <span className="text-sm text-muted">Try:</span>
            <CategoryChips label="Try searching for" chips={suggestions} shape="pill" align="center" />
          </div>
        )}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href="/products" className="max-sm:w-full">
            Browse all products
          </Button>
          <AskOnWhatsAppButton query={query} className="max-sm:w-full" />
        </div>
      </Panel>

      <CategoryShortcuts categories={categories} variant="section" />

      {popular.length > 0 && (
        <Panel as="section" aria-labelledby="popular-right-now" className="flex flex-col gap-6">
          <h2 id="popular-right-now" className="text-[1.375rem] font-bold text-ink md:text-[1.75rem]">
            Popular right now
          </h2>
          <ProductGrid products={popular} layout="five" />
        </Panel>
      )}
    </>
  );
}
