"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function fetchFleet(partnerId: string) {
  try {
    return await caller.equipment.listByPartner({ partnerId });
  } catch {
    return [];
  }
}

export interface CreateFleetItemInput {
  name: string;
  category: "JCB" | "Crane" | "Excavator";
  subType?: string;
  hourlyRate: number;
  dailyRate: number;
  images: string[];
  specifications: Record<string, unknown>;
  partnerId: string;
}

export async function createFleetItemAction(
  input: CreateFleetItemInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.create({
      name: input.name,
      category: input.category,
      subType: input.subType,
      hourlyRate: input.hourlyRate,
      dailyRate: input.dailyRate,
      images: input.images,
      specifications: input.specifications,
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add equipment." };
  }
}

export async function deleteFleetItemAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.delete({ id });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete equipment." };
  }
}
