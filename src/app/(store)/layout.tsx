import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Storefront chrome. The admin area lives outside this route group and does not get it. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div id="main-content">{children}</div>
      <Footer />
    </>
  );
}
