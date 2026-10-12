import "server-only";

import { getClustersData } from "./clusters";
import type { QuoteVillageOption } from "./quote-village-option";

export type { QuoteVillageOption } from "./quote-village-option";

export function listQuoteVillageOptions(): QuoteVillageOption[] {
  const { villages } = getClustersData();
  return villages.map((v) => ({
    id: v.id,
    name: v.name,
    mandal: v.mandal,
    roadDistanceFromHubKm: v.roadDistanceFromHubKm,
    distanceFromHubKm: v.distanceFromHubKm,
  }));
}
