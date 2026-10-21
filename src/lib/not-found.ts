import type { Metadata } from "next";

/**
 * Metadata for the storefront 404. Used by (store)/not-found and also by every route that can end in
 * notFound(): Next.js renders a request-time 404 in the browser from the route's own render, so the
 * route's metadata is what the tab finally shows.
 */
export const notFoundMetadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};
