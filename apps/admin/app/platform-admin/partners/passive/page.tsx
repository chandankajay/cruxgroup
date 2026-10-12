import { redirect } from "next/navigation";
import { listMasterCatalogAction } from "../../../(dashboard)/catalog/actions";
import { fetchPassivePartners } from "./actions";
import { PassivePartnersClient } from "./features/passive-partners-client";

export const dynamic = "force-dynamic";

export default async function PassivePartnersPage() {
  const [partners, catalog] = await Promise.all([
    fetchPassivePartners(),
    listMasterCatalogAction(),
  ]);

  if (partners === null) redirect("/dashboard");

  return (
    <PassivePartnersClient
      partners={partners}
      catalog={catalog.map((c) => ({ id: c.id, name: c.name, category: c.category }))}
    />
  );
}
