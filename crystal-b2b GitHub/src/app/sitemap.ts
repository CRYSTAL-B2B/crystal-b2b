import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  return [{
    url: siteUrl.toString(),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  }];
}
