import type { MetadataRoute } from "next";
import { getPublishedPostSlugs } from "../lib/content";
import { SITE_URL } from "../lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedPostSlugs();
  const locales = ["en", "te"] as const;
  const entries: MetadataRoute.Sitemap = [];

  for (const loc of locales) {
    entries.push({
      url: `${SITE_URL}/${loc}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
    entries.push({
      url: `${SITE_URL}/${loc}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}/${loc}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
