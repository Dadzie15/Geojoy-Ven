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

const schema = z.object({
  type: z
    .preprocess((value) => (value === undefined ? [] : [value].flat()), z.array(z.string()))
    .transform((slugs) => [...new Set(slugs.filter((slug) => slug.length <= 60 && SLUG.test(slug)))].slice(0, 20))
    .catch([]),
  min: cedis,
  max: cedis,
  stock: flag,
  sale: flag,
  sort: z.preprocess(first, z.enum(["popular", "newest", "price_asc", "price_desc"]).catch(DEFAULT_SORT)),
  page: z.preprocess(
    first,
    z
      .string()
      .regex(/^\d{1,2}$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(MAX_PAGE))
      .catch(1),
  ),
});

export function parseCatalogueParams(raw: RawSearchParams): CatalogueParams {
  const parsed = schema.parse(raw);
  let { min, max } = parsed;
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    types: parsed.type,
    min,
    max,
    inStock: parsed.stock === "1",
    onSale: parsed.sale === "1",
    sort: parsed.sort,
    page: parsed.page,
  };
}
