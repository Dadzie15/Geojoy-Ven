const wholeCedis = new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 });
const cedisAndPesewas = new Intl.NumberFormat("en-GH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a cedi amount (number or numeric string from Postgres) as "₵1,250" or "₵1,250.50". */
export function formatCedis(amount: number | string) {
  const value = Number(amount);
  const formatter = Number.isInteger(value) ? wholeCedis : cedisAndPesewas;
  return `₵${formatter.format(value)}`;
}
