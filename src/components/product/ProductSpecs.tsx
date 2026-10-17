import type { ProductSpec } from "@/lib/catalogue/types";

/** Label / value rows from products.specs. */
export function ProductSpecs({ specs }: { specs: ProductSpec[] }) {
  return (
    <dl className="flex flex-col">
      {specs.map((spec) => (
        <div key={spec.label} className="flex justify-between gap-6 border-b border-line py-3 last:border-b-0">
          <dt className="text-sm text-muted">{spec.label}</dt>
          <dd className="text-right text-sm font-semibold text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
