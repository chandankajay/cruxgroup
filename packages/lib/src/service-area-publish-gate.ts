/**
 * CWA-29 quality gate for ServiceAreaPage publishing.
 * Extend this module when CWA-29 adds copy/FAQ checks; do not bypass from the seed script.
 */
export type ServiceAreaPageGateInput = {
  readonly lastReviewed: Date | null;
  readonly thinContent: boolean;
};

export function passesCwa29ServiceAreaQualityGate(
  page: ServiceAreaPageGateInput,
): boolean {
  if (page.lastReviewed == null) return false;
  if (page.thinContent) return false;
  return true;
}

export function serviceAreaPageIsPublic(
  page: ServiceAreaPageGateInput & { readonly published: boolean },
): boolean {
  if (!page.published) return false;
  return passesCwa29ServiceAreaQualityGate(page);
}
