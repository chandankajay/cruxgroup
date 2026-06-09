import type { MetadataRoute } from "next";
import { MACHINE_SLIDES } from "../components/sections/machine-sections-data";
import { getAllArticleSlugs } from "../lib/seo/data/articles";
import {
  getAllLocationSlugs,
  getLocationBySlug,
} from "../lib/seo/data/locations";

const BASE_URL = "https://www.cruxgroup.in";
const LOCALES = ["en", "te"] as const;

function locationPriority(slug: string): number {
  const loc = getLocationBySlug(slug);
  if (!loc) return 0.7;
  if (loc.tier === "hyderabad-prime") return 0.8;
  if (loc.tier === "orr-corridor") return 0.7;
  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const locationSlugs = getAllLocationSlugs();
  const articleSlugs = getAllArticleSlugs();

  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });

    entries.push({
      url: `${BASE_URL}/${locale}/telangana`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    entries.push({
      url: `${BASE_URL}/${locale}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const slug of locationSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: locationPriority(slug),
      });
    }

    for (const slug of articleSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/articles/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const slide of MACHINE_SLIDES) {
      entries.push({
        url: `${BASE_URL}/${locale}/equipment/${slide.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    entries.push({
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
