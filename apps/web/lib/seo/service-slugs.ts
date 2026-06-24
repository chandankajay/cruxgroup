export const SERVICE_PAGE_SLUGS = [
  "compound-fence",
  "ground-levelling",
  "debris-clearing",
  "silent-rock-breaking",
] as const;

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];

export function isServicePageSlug(slug: string): slug is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly string[]).includes(slug);
}
