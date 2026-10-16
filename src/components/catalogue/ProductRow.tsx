import { Panel } from "@/components/ui/Panel";
import { ProductCard } from "@/components/ui/ProductCard";
import type { ProductCardData } from "@/lib/catalogue";
import { ScrollRow } from "./ScrollRow";

/** Width of one item: about 2.2 per view on phones, then 3, 4 and 5. */
const ITEM_CLASSES =
  "w-[42%] shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] xl:w-[calc((100%-5rem)/5)]";

const ROW_IMAGE_SIZES = "(min-width: 1280px) 228px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 42vw";

type ProductRowProps = {
  id: string;
  title: string;
  href: string;
  linkLabel?: string;
  products: ProductCardData[];
};

/** A titled panel with a horizontally scrolling row of product cards. Renders nothing when empty. */
export function ProductRow({ id, title, href, linkLabel = "Shop now", products }: ProductRowProps) {
  if (products.length === 0) return null;

  return (
    <Panel as="section" aria-labelledby={id}>
      <ScrollRow id={id} title={title} link={{ href, label: linkLabel }}>
        {products.map(({ id: productId, ...card }) => (
          <li key={productId} className={ITEM_CLASSES}>
            <ProductCard {...card} chooseOptions imageRatio="1/1" imageSizes={ROW_IMAGE_SIZES} />
          </li>
        ))}
      </ScrollRow>
    </Panel>
  );
}
