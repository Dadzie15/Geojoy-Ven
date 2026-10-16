import Link from "next/link";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Panel } from "@/components/ui/Panel";
import type { CategoryNode } from "@/lib/catalogue";

/** "Shop by category": the top-level categories as small tiles. */
export function CategoryShortcuts({ categories }: { categories: CategoryNode[] }) {
  if (categories.length === 0) return null;

  return (
    <Panel as="section" aria-labelledby="shop-by-category" className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2 id="shop-by-category" className="text-base font-bold text-ink">
          Shop by category
        </h2>
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-terracotta underline underline-offset-4 hover:text-brown"
        >
          View all<span className="sr-only"> products</span>
        </Link>
      </div>
      <ul className="grid grid-cols-4 gap-x-3 gap-y-5 lg:grid-cols-8">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryTile variant="compact" href={`/category/${category.slug}`} name={category.name} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
