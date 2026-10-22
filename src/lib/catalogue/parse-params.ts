import "server-only";
import { z } from "zod";
import { DEFAULT_SORT, MAX_PAGE, type CatalogueParams, type RawSearchParams } from "./params";

const MAX_CEDIS = 1_000_000;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Repeated params (?sort=a&sort=b) use the first value. */
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);

const cedis = z.preprocess(
  first,
  z
    .string()
    .regex(/^\d{1,7}$/)
    .transform(Number)
    .pipe(z.number().int().max(MAX_CEDIS))
    .optional()
    .catch(undefined),
);
const flag = z.preprocess(first, z.literal("1").optional().catch(undefined));
const slug = z.string().max(60).regex(SLUG);

const schema = z.object({
  type: z
    .preprocess((value) => (value === undefined ? [] : [value].flat()), z.array(z.string()))
    .transform((slugs) => [...new Set(slugs.filter((value) => slug.safeParse(value).success))].slice(0, 20))
    .catch([]),
  category: z.preprocess(first, slug.optional().catch(undefined)),
  min: cedis,
  max: cedis,
  stock: flag,
  sale: flag,
  sort: z.preprocess(
    first,
    z.enum(["relevance", "saving", "popular", "newest", "price_asc", "price_desc"]).optional().catch(undefined),
  ),
});

/** A whole page number from 1 to maxPage; anything else is page 1. */
const pageSchema = (maxPage: number) =>
  z.preprocess(
    first,
    z
      .string()
      .regex(/^\d{1,4}$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(maxPage))
      .catch(1),
  );

type ParseOptions = {
  /**
   * Highest page accepted; higher numbers fall back to page 1. Defaults to MAX_PAGE ("Load more").
   * Numbered pagination passes MAX_NUMBERED_PAGE and clamps to the last page once the total is known.
   */
  maxPage?: number;
  /** Search results: "relevance" is allowed and is the default. Elsewhere it falls back to the default sort. */
  search?: boolean;
  /** Deals: "saving" is allowed and is the default, and `category` is read. Elsewhere both are dropped. */
  deals?: boolean;
};

export function parseCatalogueParams(
  raw: RawSearchParams,
  { maxPage = MAX_PAGE, search = false, deals = false }: ParseOptions = {},
): CatalogueParams {
  const parsed = schema.parse(raw);
  const defaultSort = search ? "relevance" : deals ? "saving" : DEFAULT_SORT;
  const notOffered = (parsed.sort === "relevance" && !search) || (parsed.sort === "saving" && !deals);
  const sort = parsed.sort === undefined || notOffered ? defaultSort : parsed.sort;
  let { min, max } = parsed;
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    ...(deals && { deals, category: parsed.category }),
    types: parsed.type,
    min,
    max,
    inStock: parsed.stock === "1",
    onSale: parsed.sale === "1",
    sort,
    page: pageSchema(maxPage).parse(raw.page),
  };
}
