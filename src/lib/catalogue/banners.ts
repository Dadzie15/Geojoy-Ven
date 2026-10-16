import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Banner } from "./types";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
};

/**
 * Active banners whose schedule includes now (no start / end date means always), by sort_order.
 * Pages are cached, so a scheduled banner appears or ends at the next revalidation.
 */
export async function getActiveBanners(): Promise<Banner[]> {
  const now = new Date().toISOString();
  const { data, error } = await createPublicClient()
    .from("banners")
    .select("id, title, subtitle, image_url, link_url")
    .eq("is_active", true)
    // One logic tree: (no start or started) and (no end or not ended yet).
    .or(`and(or(starts_at.is.null,starts_at.lte.${now}),or(ends_at.is.null,ends_at.gt.${now}))`)
    .order("sort_order")
    .overrideTypes<BannerRow[], { merge: false }>();
  if (error) throw new Error(`Could not load banners: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
  }));
}
