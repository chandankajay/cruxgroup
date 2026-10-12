export const SERVICE_LEAD_STAGES = [
  "NEW",
  "SITE_VISIT_SCHEDULED",
  "SITE_VISIT_DONE",
  "QUOTATION_SENT",
  "QUOTE_ACCEPTED",
  "ADVANCE_RECEIVED",
  "COMPLETED",
  "LOST",
] as const;

export type ServiceLeadStageId = (typeof SERVICE_LEAD_STAGES)[number];

export const SERVICE_LEAD_STAGE_LABELS: Record<ServiceLeadStageId, string> = {
  NEW: "New",
  SITE_VISIT_SCHEDULED: "Site visit scheduled",
  SITE_VISIT_DONE: "Site visit done",
  QUOTATION_SENT: "Quotation sent",
  QUOTE_ACCEPTED: "Quote accepted",
  ADVANCE_RECEIVED: "Advance received",
  COMPLETED: "Completed",
  LOST: "Lost",
};

export const SERVICE_CATALOG_SLUGS = [
  "land-levelling",
  "earthworks-excavation",
  "precast-wall",
  "farmhouse-construction",
  "compound-fencing",
  "debris-rock-breaking",
] as const;

export type ServiceCatalogSlug = (typeof SERVICE_CATALOG_SLUGS)[number];

export const SERVICE_CATALOG_LABELS: Record<ServiceCatalogSlug, string> = {
  "land-levelling": "Land levelling",
  "earthworks-excavation": "Earthworks & excavation",
  "precast-wall": "Precast wall installation",
  "farmhouse-construction": "Farmhouse construction",
  "compound-fencing": "Compound fencing",
  "debris-rock-breaking": "Debris clearing & rock breaking",
};

/** Legacy web slug → canonical service slug */
export const SERVICE_SLUG_ALIASES: Record<string, ServiceCatalogSlug> = {
  "ground-levelling": "land-levelling",
};

export function resolveServiceSlug(raw: string): ServiceCatalogSlug | null {
  const normalized = raw.trim().toLowerCase();
  if ((SERVICE_CATALOG_SLUGS as readonly string[]).includes(normalized)) {
    return normalized as ServiceCatalogSlug;
  }
  const alias = SERVICE_SLUG_ALIASES[normalized];
  return alias ?? null;
}
