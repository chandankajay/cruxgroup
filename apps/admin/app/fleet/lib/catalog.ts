import "server-only";

import { cache } from "react";
import { prisma } from "@repo/db";
import type { MasterCatalogFormRow } from "../catalog-types";

/** Deduped per request; direct Prisma (no tRPC hop). */
export const getMasterCatalog = cache(async (): Promise<MasterCatalogFormRow[]> => {
  try {
    const rows = await prisma.masterCatalog.findMany({
      orderBy: { name: "asc" },
    });
    return rows as MasterCatalogFormRow[];
  } catch (e) {
    console.error("[fleet] masterCatalog:", e);
    return [];
  }
});
