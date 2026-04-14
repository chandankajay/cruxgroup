"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function fetchEquipment() {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}
