import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getMenuCategories } from "@/lib/catalogue";

/**
 * Storefront chrome. The admin area lives outside this route group and does not get it.
 * Menu data comes through the cached catalogue layer, so pages keep their static/revalidate behaviour.
 */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getMenuCategories();

  return (
    <>
      <Header categories={categories} />
      <div id="main-content">{children}</div>
      <Footer categories={categories} />
    </>
  );
}
