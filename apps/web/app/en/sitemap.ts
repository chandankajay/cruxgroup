import type { MetadataRoute } from "next";
import { buildLocaleSitemap } from "../../lib/seo/build-locale-sitemap";

/** Native Next.js sitemap for GSC `/en/` URL prefix — see `lib/seo/build-locale-sitemap.ts`. */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildLocaleSitemap("en");
}
