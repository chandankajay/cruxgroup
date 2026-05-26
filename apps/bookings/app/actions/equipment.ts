"use server";

import { createCaller, type EquipmentListOutput, type NearbyEquipmentOutput } from "@repo/api";

const caller = createCaller({});

export async function fetchEquipment(): Promise<EquipmentListOutput> {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}

export async function fetchNearbyEquipment(
  lat: number,
  lng: number
): Promise<NearbyEquipmentOutput> {
  try {
    return await caller.equipment.getNearby({ lat, lng });
  } catch {
    return [];
  }
}

