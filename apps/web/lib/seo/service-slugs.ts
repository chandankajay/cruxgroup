export const SERVICE_PAGE_SLUGS = [
  "land-levelling",
  "earthworks-excavation",
  "precast-wall",
  "farmhouse-construction",
  "compound-fencing",
  "debris-rock-breaking",
  /** Legacy URLs still generated for redirects / static paths */
  "ground-levelling",
  "compound-fence",
  "debris-clearing",
  "silent-rock-breaking",
] as const;

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];

export function isServicePageSlug(slug: string): slug is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly string[]).includes(slug);
}
