import Link from "next/link";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Panel } from "@/components/ui/Panel";
import type { CategoryNode } from "@/lib/catalogue";

type CategoryShortcutsProps = {
  categories: CategoryNode[];
  /** "home": small title with "View all". "section": section-size title, no link (Search no-results). */
  variant?: "home" | "section";
};

/** "Shop by category": the top-level categories as small tiles. */
export function CategoryShortcuts({ categories, variant = "home" }: CategoryShortcutsProps) {
  if (categories.length === 0) return null;

  return (
    <Panel as="section" aria-labelledby="shop-by-category" className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2
          id="shop-by-category"
          className={
            variant === "home" ? "text-base font-bold text-ink" : "text-[1.375rem] font-bold text-ink md:text-[1.75rem]"
          }
        >
          Shop by category
        </h2>
        {variant === "home" && (
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-terracotta underline underline-offset-4 hover:text-brown"
          >
            View all<span className="sr-only"> products</span>
          </Link>
        )}
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
