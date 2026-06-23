import { createCaller } from "@repo/api";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { requirePinSetup } from "../lib/require-pin-setup";
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
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  await requirePinSetup();

  const fallbackEquipment = await getEquipment();

  return <HomeContent fallbackEquipment={fallbackEquipment} />;
}
