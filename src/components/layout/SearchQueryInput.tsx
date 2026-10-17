"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { InputHTMLAttributes } from "react";
import { normaliseQuery } from "@/lib/catalogue/params";

/** The header search input. On the Search page it shows the current query; elsewhere it starts empty. */
export function SearchQueryInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = pathname === "/search" ? normaliseQuery(searchParams.get("q")) : "";
  // A new query (another search, back button) resets the field to it.
  return <input key={query} defaultValue={query} {...props} />;
}
