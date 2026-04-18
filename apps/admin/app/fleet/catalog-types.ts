/** Shared shape for fleet UI + `getMasterCatalog()` (no `server-only` — safe for client). */
export type MasterCatalogFormRow = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly imageUrl: string;
  readonly specifications: unknown;
  readonly minHourlyRate: number;
  readonly maxHourlyRate: number;
  readonly minDailyRate: number;
  readonly maxDailyRate: number;
};
