/** Map fleet / CMS equipment labels to `/equipment/[slug]` routes. */
export function equipmentSlugFromHeading(
  heading: string | null | undefined,
): string | undefined {
  if (!heading) return undefined;
  const h = heading.toLowerCase();
  if (h.includes("post hole") || h.includes("posthole")) return "posthole";
  if (h.includes("borewell") || h.includes("bore well")) return "borewell";
  if (h === "jcb" || h.includes("backhoe")) return "jcb";
  if (h.includes("crane")) return "crane";
  return undefined;
}

/** CMS fleet card heading → equipment page slug (exact match, first wins). */
export const FLEET_HEADING_TO_EQUIPMENT_SLUG: Record<string, string> = {
  jcb: "jcb",
  crane: "crane",
  "big cranes": "crane",
  "mini crane": "crane",
  "post hole digger": "posthole",
  "borewell drilling": "borewell",
};

export function fleetHeadingToEquipmentSlug(
  heading: string | null | undefined,
): string | undefined {
  if (!heading) return undefined;
  return FLEET_HEADING_TO_EQUIPMENT_SLUG[heading.toLowerCase()];
}

export const EQUIPMENT_PAGE_SLUGS = ["jcb", "posthole", "crane", "borewell"] as const;
