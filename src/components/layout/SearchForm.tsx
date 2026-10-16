import { Search } from "lucide-react";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type SearchFormProps = { id: string; className?: string; autoFocus?: boolean };

export function SearchForm({ id, className, autoFocus }: SearchFormProps) {
  return (
    <form action="/search" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        autoFocus={autoFocus}
        placeholder="Search for products, categories and more..."
        className="h-12 w-full rounded-input border border-line bg-field pr-14 pl-4 text-sm text-ink placeholder:text-muted focus:border-brown"
      />
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
