"use server";

import { createCaller, type EquipmentListOutput } from "@repo/api";

const caller = createCaller({});

export async function fetchEquipment(): Promise<EquipmentListOutput> {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}
