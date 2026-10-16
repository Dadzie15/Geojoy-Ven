import { Button } from "@/components/ui/Button";

type LoadMoreProps = {
  shown: number;
  total: number;
  /** Link to the next page (works without JavaScript); null at the end. */
  href: string | null;
};

/** "You have seen X of Y products", a progress bar and a "Load more" link. */
export function LoadMore({ shown, total, href }: LoadMoreProps) {
  if (total === 0) return null;
  const percent = Math.round((shown / total) * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-muted">
        You have seen {shown} of {total} {total === 1 ? "product" : "products"}
      </p>
      <div aria-hidden="true" className="h-0.5 w-60 max-w-full rounded-pill bg-line">
        <div className="h-full rounded-pill bg-brown" style={{ width: `${percent}%` }} />
      </div>
      {href && (
        <Button href={href} variant="secondary" className="mt-1">
          Load more<span className="sr-only"> products</span>
        </Button>
      )}
    </div>
  );
}
