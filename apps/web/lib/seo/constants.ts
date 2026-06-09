/** Route segments that must not be treated as location slugs. */
export const RESERVED_LOCATION_SLUGS = new Set([
  "equipment",
  "blog",
  "articles",
  "telangana",
  "about",
  "contact",
  "sitemap",
  "api",
]);

export const SEO_LOCALES = ["en", "te"] as const;
