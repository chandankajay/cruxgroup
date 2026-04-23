"use server";

import { createCaller } from "@repo/api";
import { prisma } from "@repo/db";
import {
  getAuthorizedWhereClause,
  requireAdminResourceAuthz,
} from "../../lib/resource-authz";

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
  const adminCtx = await requireAdminResourceAuthz();
  if (!adminCtx) {
    return { success: false, error: "Forbidden" };
  }
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
  const adminCtx = await requireAdminResourceAuthz();
  if (!adminCtx) {
    return { success: false, error: "Forbidden" };
  }
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
  const adminCtx = await requireAdminResourceAuthz();
  if (!adminCtx) {
    return { success: false, error: "Forbidden" };
  }
  try {
    const where = getAuthorizedWhereClause(adminCtx, { resource: "Equipment", targetId: id });
    const row = await prisma.equipment.findFirst({ where, select: { id: true } });
    if (!row) {
      return { success: false, error: "DELETE_FAILED" };
    }
    await prisma.equipment.delete({ where: { id: row.id } });
    return { success: true };
  } catch {
    return { success: false, error: "DELETE_FAILED" };
  }
}
