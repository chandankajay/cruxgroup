import { listMasterCatalogAction } from "./actions";
import { CatalogTable } from "./catalog-table";

export const metadata = { title: "Master Catalog" };

export default async function MasterCatalogPage() {
  const catalog = await listMasterCatalogAction();

  return (
    <div className="mx-auto w-full max-w-4xl pb-16">
      <h1 className="text-xl font-bold text-charcoal sm:text-2xl">
        Master catalog
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform equipment types with rate guardrails. Upload or replace type
        images — they apply to bookings and new partner fleet entries.
      </p>

      {catalog.length === 0 ? (
        <div
          className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">No equipment types found.</p>
          <p className="mt-1 text-amber-900/90">
            Run{" "}
            <code className="rounded bg-muted/90 px-1.5 py-0.5 text-xs">
              prisma db seed
            </code>{" "}
            to populate the master catalog.
          </p>
        </div>
      ) : (
        <CatalogTable rows={catalog} />
      )}
    </div>
  );
}
