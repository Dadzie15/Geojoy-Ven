import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notFoundMetadata } from "@/lib/not-found";

export const metadata: Metadata = notFoundMetadata;

/**
 * Any URL no other route matches. Next.js sends unmatched URLs to the root not-found, which has no
 * storefront layout; this catch-all sends them to (store)/not-found instead, with status 404.
 * Every real route (and the future /admin area) is more specific, so it always wins over this one.
 */
export default function UnknownPage(): never {
  notFound();
}
