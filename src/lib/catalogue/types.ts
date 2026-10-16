import type { ProductCardProps } from "@/components/ui/ProductCard";
import type { ImageData } from "@/components/ui/Thumbnail";

/**
 * A Postgres numeric(10,2) amount as an exact decimal string, e.g. "1250.00".
 * Format it with `formatCedis`; never do arithmetic on it as a float.
 */
export type Money = string;

export type CategoryLink = { id: string; name: string; slug: string };

export type CategoryNode = CategoryLink & {
  sortOrder: number;
  /** Active products in this category, including all of its children. */
  productCount: number;
  children: CategoryNode[];
};

export type CategoryDetail = CategoryNode & {
  parent: CategoryLink | null;
  /** From the top-level category down to this one. */
  breadcrumb: CategoryLink[];
};

export type ProductSort = "popular" | "newest" | "price_asc" | "price_desc";
export type SearchSort = ProductSort | "relevance";

export type ProductFilters = {
  /** Category slug, or several slugs (products in any of them). A parent includes all of its children. */
  category?: string | string[];
  /** Child category slug (a "type" filter inside a parent category). */
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
};

export type Pagination = { page?: number; pageSize?: number };

export type ListProductsOptions = ProductFilters & Pagination & { sort?: ProductSort };
export type SearchProductsOptions = ProductFilters & Pagination & { sort?: SearchSort };

/** ProductCard props plus the fields the card needs for "From ₵x" and stock states. */
export type ProductCardData = ProductCardProps & {
  id: string;
  /** True when variants have different prices, so the price reads "From ₵x". */
  priceFrom: boolean;
  inStock: boolean;
};

export type ProductList = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSpec = { label: string; value: string };

export type ProductVariant = {
  id: string;
  name: string;
  price: Money;
  stock: number;
  sku: string | null;
};

export type ProductImage = { id: string; url: string; alt: string };

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: Money;
  compareAtPrice: Money | null;
  badge: string | null;
  isBulky: boolean;
  specs: ProductSpec[];
  category: CategoryLink | null;
  /** Parent of `category` when the product sits in a child category. */
  parentCategory: CategoryLink | null;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type PriceRange = { min: Money; max: Money };

/** Price filter bounds for a category page or a search results page. */
export type PriceRangeScope = { category: string } | { q: string };

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

/** The on-sale product a categories menu promo card shows. */
export type MenuDeal = {
  name: string;
  href: string;
  image?: ImageData;
  /** Old price minus price, e.g. "50.00". */
  saving: Money;
};

/** A top-level category as the categories menus show it. */
export type MenuCategory = {
  name: string;
  slug: string;
  children: { name: string; slug: string }[];
  /** The category's first on-sale product, else the shop's; null when nothing is on sale. */
  deal: MenuDeal | null;
};
