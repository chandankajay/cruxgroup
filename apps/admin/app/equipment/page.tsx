import { createCaller } from "@repo/api";
import { EquipmentPageContent } from "./features/equipment-page-content";

const caller = createCaller({});

async function getEquipment() {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}

export default async function EquipmentPage() {
  const equipment = await getEquipment();

  return <EquipmentPageContent initialData={equipment} />;
}
