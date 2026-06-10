import type { MetadataRoute } from "next";
import { getAllArticleSlugs } from "./data/articles";
import {
  getAllLocationSlugs,
  getLocationBySlug,
  type LocationTier,
} from "./data/locations";
import { EQUIPMENT_PAGE_SLUGS } from "./equipment-slugs";

const BASE_URL = "https://www.cruxgroup.in";

function locationPriority(tier: LocationTier | undefined): number {
  switch (tier) {
    case "hyderabad-prime":
      return 0.8;
    case "orr-corridor":
      return 0.7;
    case "district-hq":
      return 0.7;
    case "industrial-belt":
      return 0.7;
    default:
      return 0.7;
  }
}

export function buildLocaleSitemap(locale: string): MetadataRoute.Sitemap {
  const prefix = `${BASE_URL}/${locale}`;
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: prefix,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${prefix}/telangana`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${prefix}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${prefix}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  for (const slug of getAllLocationSlugs()) {
    const loc = getLocationBySlug(slug);
    entries.push({
      url: `${prefix}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: locationPriority(loc?.tier),
    });
  }

  for (const slug of getAllArticleSlugs()) {
    entries.push({
      url: `${prefix}/articles/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const slug of EQUIPMENT_PAGE_SLUGS) {
    entries.push({
      url: `${prefix}/equipment/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
