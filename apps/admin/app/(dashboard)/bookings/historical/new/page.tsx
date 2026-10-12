import { redirect } from "next/navigation";
import { fetchAssignablePartners } from "../../../../platform-admin/partners/passive/actions";
import { fetchMasterCatalogForHistorical } from "./actions";
import { HistoricalJobForm } from "./features/historical-job-form";

export const dynamic = "force-dynamic";

export default async function HistoricalJobPage() {
  const { prisma } = await import("@repo/db");
  const [partners, catalog, customers] = await Promise.all([
    fetchAssignablePartners(),
    fetchMasterCatalogForHistorical(),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true, gstin: true },
    }),
  ]);

  if (partners.length === 0) redirect("/platform-admin/partners/passive");
  if (catalog.length === 0) redirect("/catalog");

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-charcoal">Past job record</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Backdate a completed phone job — no notifications. Pick machine type from the master
          catalog (fleet row optional). Compose the invoice later.
        </p>
      </header>
      <HistoricalJobForm partners={partners} customers={customers} catalog={catalog} />
    </div>
  );
}
