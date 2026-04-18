import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { getMasterCatalog } from "../lib/catalog";
import { AddEquipmentForm } from "./add-equipment-form";

/** Catalog rows include rate guardrails; the form applies min/max on inputs and Zod validates on submit. */
export default async function NewFleetEquipmentPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const catalog = await getMasterCatalog();

  return <AddEquipmentForm catalog={catalog} />;
}
