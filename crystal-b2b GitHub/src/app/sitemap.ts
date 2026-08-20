import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

// Обновлять при значимых изменениях контента главной — не при каждой сборке,
// иначе sitemap врёт поисковикам о свежести страницы.
const HOME_LAST_MODIFIED = new Date("2026-08-20");

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  return [{
    url: siteUrl.toString(),
    lastModified: HOME_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 1,
  }];
}
