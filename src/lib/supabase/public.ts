import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Cache tag on every catalogue read. Admin saves call `revalidateTag(CATALOGUE_TAG)`. */
export const CATALOGUE_TAG = "catalogue";

/** Seconds before a cached catalogue read is refreshed in the background. */
export const CATALOGUE_REVALIDATE_SECONDS = 3600;

/**
 * Cookie-free Supabase client for public catalogue reads. It uses the anon key, so RLS
 * only returns active rows, and never touches cookies, so pages using it can be
 * statically rendered and revalidated. Use the cookie client in ./server for anything
 * user-specific.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            next: { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [CATALOGUE_TAG] },
          }),
      },
    },
  );
}
