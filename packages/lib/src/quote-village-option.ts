/** Minimal village row for the public quote form (safe to pass to client components). */
export type QuoteVillageOption = {
  id: string;
  name: string;
  mandal: string;
  roadDistanceFromHubKm: number;
  distanceFromHubKm: number;
};
