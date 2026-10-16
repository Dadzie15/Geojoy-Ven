import { ProductCard } from "@/components/ui/ProductCard";
import type { ThumbnailRatio } from "@/components/ui/Thumbnail";
import type { ProductCardData } from "@/lib/catalogue";

type GridLayout = "listing" | "five" | "six";

const layouts: Record<GridLayout, { classes: string; ratio: ThumbnailRatio; sizes: string }> = {
  // Category, Search: 2 / 3 columns beside the filters sidebar.
  listing: {
    classes: "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6",
    ratio: "6/5",
    sizes: "(min-width: 1280px) 286px, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw",
  },
  // All products (no sidebar): 2 / 3 / 4 / 5 columns.
  five: {
    classes: "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5",
    ratio: "1/1",
    sizes: "(min-width: 1280px) 230px, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw",
  },
  // Home "Kitchen appliances": 2 / 3 / 6 columns.
  six: {
    classes: "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-6",
    ratio: "4/5",
    sizes: "(min-width: 1280px) 186px, (min-width: 1024px) 15vw, (min-width: 768px) 31vw, 50vw",
  },
};

type ProductGridProps = {
  products: ProductCardData[];
  layout?: GridLayout;
  /** Gives each item an id (`${prefix}-1`, `${prefix}-2` ...) so "Load more" can link to the first new product. */
  itemIdPrefix?: string;
};

/** Product cards in a responsive grid. "+" links to the product page until adding to the bag arrives. */
export function ProductGrid({ products, layout = "listing", itemIdPrefix }: ProductGridProps) {
  const { classes, ratio, sizes } = layouts[layout];
  return (
    <ul className={classes}>
      {products.map(({ id, ...card }, index) => (
        <li key={id} id={itemIdPrefix && `${itemIdPrefix}-${index + 1}`} className="scroll-mt-6">
          <ProductCard {...card} chooseOptions imageRatio={ratio} imageSizes={sizes} />
        </li>
      ))}
    </ul>
  );
}
