import { BagProvider } from "@/components/bag/BagProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getMenuCategories } from "@/lib/catalogue";

/**
 * Storefront chrome. The admin area lives outside this route group and does not get it.
 * Menu data comes through the cached catalogue layer, so pages keep their static/revalidate behaviour.
 * The bag (header count, "Added to your bag" drawer) is read in the browser through Server Actions,
 * so this layout never reads the bag cookie.
 */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getMenuCategories();

  return (
    <BagProvider>
      <Header categories={categories} />
      <div id="main-content">{children}</div>
      <Footer categories={categories} />
    </BagProvider>
  );
}
