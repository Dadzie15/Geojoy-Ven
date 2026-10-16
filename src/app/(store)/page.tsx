import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductRow } from "@/components/catalogue/ProductRow";
import { CategoryExploreStrip } from "@/components/home/CategoryExploreStrip";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { HeroBanner } from "@/components/home/HeroBanner";
import { KitchenAppliances } from "@/components/home/KitchenAppliances";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getActiveBanners, getCategoryTree, listProducts } from "@/lib/catalogue";
import { homeTopics } from "@/lib/whatsapp";

// Static, refreshed hourly; admin changes refresh it sooner with revalidateTag("catalogue").
export const revalidate = 3600;

const title = "GeoJoy Ventures | Kitchen appliances and household goods in Ghana";
const description =
  "Shop kitchen appliances, cookware and household goods, delivered anywhere in Ghana. Pay securely with Mobile Money.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "GeoJoy Ventures", locale: "en_GH", title, description },
};

const KITCHEN_SLUG = "kitchen-appliances";
const ROW_SIZE = 10;
const GRID_SIZE = 6;

export default async function HomePage() {
  const [banners, tree, promotions, newArrivals, kitchen, kitchenByChild, cookware, homeAndLaundry] =
    await Promise.all([
      getActiveBanners(),
      getCategoryTree(),
      listProducts({ onSale: true, sort: "popular", pageSize: ROW_SIZE }),
      listProducts({ sort: "newest", pageSize: ROW_SIZE }),
      listProducts({ category: KITCHEN_SLUG, pageSize: GRID_SIZE }),
      // The tree is cached per request, so this reuses the call above.
      getCategoryTree().then((categories) =>
        Promise.all(
          (categories.find((category) => category.slug === KITCHEN_SLUG)?.children ?? []).map(async (child) => ({
            child,
            products: (await listProducts({ subcategory: child.slug, pageSize: GRID_SIZE })).items,
          })),
        ),
      ),
      listProducts({ category: "cookware", pageSize: ROW_SIZE }),
      listProducts({ category: ["laundry", "bathroom", "mats", "storage"], pageSize: ROW_SIZE }),
    ]);

  const kitchenCategory = tree.find((category) => category.slug === KITCHEN_SLUG);

  return (
    <>
      <main className="py-6">
        <Container className="flex flex-col gap-6">
          {banners.length > 0 ? (
            <HeroBanner banners={banners} />
          ) : (
            <h1 className="sr-only">GeoJoy Ventures: kitchen appliances and household goods in Ghana</h1>
          )}
          <TrustStrip />
          <CategoryShortcuts categories={tree.slice(0, 8)} />
          <ProductRow id="promotion" title="Promotion" href="/deals" products={promotions.items} />
          <ProductRow
            id="new-arrivals"
            title="New arrivals"
            href="/products?sort=newest"
            products={newArrivals.items}
          />
          <CategoryExploreStrip
            categories={tree.map(({ id, name, slug, productCount }) => ({ id, name, slug, productCount }))}
          />
          {kitchenCategory && (
            <KitchenAppliances category={kitchenCategory} products={kitchen.items} byChild={kitchenByChild} />
          )}
          <ProductRow id="cookware" title="Cookware" href="/category/cookware" products={cookware.items} />
          <ProductRow
            id="home-and-laundry"
            title="Home & laundry"
            href="/category/laundry"
            products={homeAndLaundry.items}
          />
        </Container>
      </main>
      <WhatsAppButton topics={homeTopics} />
    </>
  );
}
