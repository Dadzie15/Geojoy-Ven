import Link from "next/link";
import { ProductTabs } from "@/components/catalogue/ProductTabs";
import { Panel } from "@/components/ui/Panel";
import { ProductCard } from "@/components/ui/ProductCard";
import type { CategoryNode, ProductCardData } from "@/lib/catalogue";

const GRID_IMAGE_SIZES = "(min-width: 1280px) 186px, (min-width: 1024px) 15vw, (min-width: 768px) 31vw, 50vw";

type KitchenAppliancesProps = {
  category: CategoryNode;
  /** Products across the whole category (the "All" tab). */
  products: ProductCardData[];
  /** Products per child category, in the category's child order. */
  byChild: { child: CategoryNode; products: ProductCardData[] }[];
};

function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-6">
      {products.map(({ id, ...card }) => (
        <li key={id}>
          <ProductCard {...card} chooseOptions imageRatio="4/5" imageSizes={GRID_IMAGE_SIZES} />
        </li>
      ))}
    </ul>
  );
}

/** Kitchen Appliances grid with a tab per child category. Hidden when the category has no products. */
export function KitchenAppliances({ category, products, byChild }: KitchenAppliancesProps) {
  if (products.length === 0) return null;

  const tabs = [
    { key: "all", label: "All", panel: <ProductGrid products={products} /> },
    ...byChild
      .filter((entry) => entry.products.length > 0)
      .map(({ child, products: childProducts }) => ({
        key: child.slug,
        label: child.name,
        panel: <ProductGrid products={childProducts} />,
      })),
  ];

  return (
    <Panel as="section" aria-labelledby="kitchen-appliances" className="flex flex-col gap-6">
      <ProductTabs
        label={`${category.name} types`}
        heading={
          <h2 id="kitchen-appliances" className="text-[1.375rem] font-bold text-ink md:text-[1.75rem]">
            Kitchen appliances
          </h2>
        }
        tabs={tabs}
      />
      <Link
        href={`/category/${category.slug}`}
        className="mx-auto inline-flex min-h-11 items-center rounded-input px-2 font-heading text-[0.8125rem] font-semibold text-ink hover:text-brown-light"
      >
        Load more<span className="sr-only"> kitchen appliances</span>
      </Link>
    </Panel>
  );
}
