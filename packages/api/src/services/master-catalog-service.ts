import { prisma } from "@repo/db";

export async function listMasterCatalog() {
  return prisma.masterCatalog.findMany({
    orderBy: { name: "asc" },
  });
}
