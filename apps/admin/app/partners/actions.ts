"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function fetchPartners() {
  try {
    return await caller.partner.list();
  } catch {
    return [];
  }
}

export interface UpdateServiceAreaInput {
  id: string;
  lat: number;
  lng: number;
  maxServiceRadius: number;
  baseAddress?: string;
}

export async function updateServiceAreaAction(
  input: UpdateServiceAreaInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.partner.updateServiceArea(input);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save service area settings." };
  }
}
