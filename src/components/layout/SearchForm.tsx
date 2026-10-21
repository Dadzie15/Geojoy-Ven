import { Search } from "lucide-react";
import { Suspense } from "react";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { MAX_QUERY_LENGTH } from "@/lib/catalogue/params";
import { SearchQueryInput } from "./SearchQueryInput";

type SearchFormProps = {
  id: string;
  className?: string;
  autoFocus?: boolean;
  /** Defaults to the header's "Search for products, categories and more...". */
  placeholder?: string;
};

export function SearchForm({
  id,
  className,
  autoFocus,
  placeholder = "Search for products, categories and more...",
}: SearchFormProps) {
  const inputProps = {
    id,
    name: "q",
    type: "search",
    maxLength: MAX_QUERY_LENGTH,
    autoFocus,
    placeholder,
    className:
      "h-12 w-full rounded-input border border-line bg-field pr-14 pl-4 text-sm text-ink placeholder:text-muted focus:border-brown",
  };

  return (
    <form action="/search" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      {/* Reading the URL needs a Suspense boundary on statically rendered pages; until then the field is empty. */}
      <Suspense fallback={<input {...inputProps} />}>
        <SearchQueryInput {...inputProps} />
      </Suspense>
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 place-items-center rounded-input bg-brown text-field transition-colors hover:bg-brown-light motion-reduce:transition-none"
      >
        <Search className="size-4" {...iconProps} />
      </button>
    </form>
  );
}
