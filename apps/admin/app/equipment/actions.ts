"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function fetchEquipmentList() {
  try {
    return await caller.equipment.list();
  } catch {
    return [];
  }
}

interface CreateInput {
  name: string;
  category: "JCB" | "Crane" | "Excavator";
  subType?: string;
  hourlyRate: number;
  dailyRate: number;
  images: string[];
  specifications: Record<string, unknown>;
}

export async function createEquipmentAction(
  input: CreateInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.create(input);
    return { success: true };
  } catch {
    return { success: false, error: "CREATE_FAILED" };
  }
}

interface UpdateInput extends CreateInput {
  id: string;
}

export async function updateEquipmentAction(
  input: UpdateInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.update(input);
    return { success: true };
  } catch {
    return { success: false, error: "UPDATE_FAILED" };
  }
}

export async function deleteEquipmentAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.delete({ id });
    return { success: true };
  } catch {
    return { success: false, error: "DELETE_FAILED" };
  }
}
