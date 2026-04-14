import { createCaller } from "@repo/api";
import { HomeContent } from "./components/booking/home-content";

const caller = createCaller({});

async function getEquipment() {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}

export default async function Page() {
  const equipment = await getEquipment();

  return <HomeContent equipment={equipment} />;
}
