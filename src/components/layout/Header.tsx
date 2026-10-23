import { ChevronDown, Heart, Tag, User } from "lucide-react";
import Link from "next/link";
import { BagLink } from "@/components/bag/BagLink";
import { iconProps } from "@/components/ui/icon";
import { Logo } from "@/components/ui/Logo";
import {
  aboutLink,
  accountLink,
  categoryHref,
  contactLink,
  dealsLink,
  savedLink,
  trackOrderLink,
} from "@/lib/navigation";
import type { MenuCategory } from "@/lib/catalogue/types";
import { CategoriesMenu } from "./CategoriesMenu";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { MobileSearch } from "./MobileSearch";
import { SearchForm } from "./SearchForm";

type HeaderProps = {
  categories: MenuCategory[];
  /** A fixed bag count (the UI kit). The storefront leaves it out and shows the real bag. */
  bagCount?: number;
};

const iconLinkClasses = "min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-input text-ink";

export function Header({ categories, bagCount }: HeaderProps) {
  return (
    <header>
      <a
        href="#main-content"
        className="sr-only rounded-input bg-field px-4 py-3 font-heading text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>

      <div className="bg-brown text-field [&_*:focus-visible]:outline-field">
        <Container className="flex min-h-9 items-center justify-center py-1.5 text-xs md:justify-between md:text-sm">
          <nav aria-label="Company" className="hidden gap-6 md:flex">
            {[aboutLink, contactLink].map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-center font-semibold">Welcome to GeoJoy Ventures · Pay securely with Mobile Money</p>
          <Link href={trackOrderLink.href} className="hidden hover:underline md:block">
            {trackOrderLink.label}
          </Link>
        </Container>
      </div>

      <div className="relative border-b border-line">
        <Container className="flex h-16 items-center gap-1 md:h-22 md:gap-6 lg:gap-9">
          <div className="-ml-2.5 md:hidden">
            <MobileMenu trigger="icon" categories={categories} />
          </div>
          <Link href="/" aria-label="GeoJoy Ventures home" className="shrink-0 rounded-input">
            <Logo />
          </Link>
          <SearchForm id="header-search" className="hidden min-w-0 flex-1 md:block" />
          <div className="-mr-2.5 ml-auto flex items-center md:mr-0 md:gap-3 lg:gap-6">
            <MobileSearch />
            <Link href={accountLink.href} className={`${iconLinkClasses} hidden md:flex`}>
              <User className="size-6" {...iconProps} />
              <span className="sr-only flex-col text-left leading-tight lg:not-sr-only lg:flex">
                <span className="text-[0.8125rem] text-muted">Sign in</span>
                <span className="text-[0.8125rem] font-semibold">{accountLink.label}</span>
              </span>
            </Link>
            <Link href={savedLink.href} aria-label={savedLink.label} className={`${iconLinkClasses} hidden md:flex`}>
              <Heart className="size-6" {...iconProps} />
            </Link>
            <BagLink count={bagCount} className={iconLinkClasses} />
          </div>
        </Container>
      </div>

      <div className="relative hidden border-b border-line md:block">
        <Container className="flex h-15 items-center gap-6">
          {/* Tablets get the slide-out menu; 1024 px and up get the categories panel. */}
          <div className="lg:hidden">
            <MobileMenu trigger="categories" categories={categories} />
          </div>
          <div className="hidden lg:block">
            <CategoriesMenu categories={categories} />
          </div>
          <nav aria-label="Categories" className="min-w-0 flex-1">
            <ul className="flex items-center gap-5 overflow-x-auto p-1 [scrollbar-width:none] xl:gap-7">
              {categories.map((category) => (
                <li key={category.slug} className="shrink-0">
                  <Link
                    href={categoryHref(category.slug)}
                    className="flex min-h-11 items-center gap-1 font-heading text-sm font-medium whitespace-nowrap text-ink hover:text-brown-light"
                  >
                    {category.name}
                    {category.children.length > 0 && <ChevronDown className="size-4" {...iconProps} />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            href={dealsLink.href}
            className="flex min-h-11 shrink-0 items-center gap-1.5 font-heading text-sm font-medium text-terracotta hover:underline"
          >
            <Tag className="size-4" {...iconProps} />
            {dealsLink.label}
          </Link>
        </Container>
      </div>
    </header>
  );
}
