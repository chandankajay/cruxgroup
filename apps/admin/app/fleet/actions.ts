"use server";

import type { KycStatus } from "@prisma/client";
import { createCaller } from "@repo/api";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import {
  getAuthorizedWhereClause,
  getResourceAuthzContext,
} from "../../lib/resource-authz";
import type { AddFleetEquipmentValues } from "./new/schema";

const caller = createCaller({});

export interface FleetEquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { hourly: number; daily: number };
  images: string[];
  specifications: unknown;
  isActive: boolean;
}

export interface FleetPageData {
  items: FleetEquipmentItem[];
  partnerKycStatus: KycStatus | null;
}

export async function fetchFleet(userId: string): Promise<FleetPageData> {
  try {
    const [rows, partner] = await Promise.all([
      caller.equipment.listByPartner({ partnerId: userId }),
      prisma.partner.findUnique({
        where: { userId },
        select: { kycStatus: true },
      }),
    ]);
    const partnerKycStatus = partner?.kycStatus ?? null;
    const items: FleetEquipmentItem[] = rows.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      subType: e.subType,
      pricing: e.pricing as { hourly: number; daily: number },
      images: e.images,
      specifications: e.specifications,
      isActive: e.isActive,
    }));
    return { items, partnerKycStatus };
  } catch {
    return { items: [], partnerKycStatus: null };
  }
}

export async function toggleFleetEquipmentActiveAction(
  equipmentId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getResourceAuthzContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    if (ctx.role === "PARTNER") {
      const partner = await prisma.partner.findUnique({
        where: { userId: ctx.userId },
        select: { kycStatus: true },
      });
      if (!partner) return { success: false, error: "Partner not found." };
      if (partner.kycStatus !== "VERIFIED") {
        return { success: false, error: "Complete KYC verification to change availability." };
      }
    }

    const where = getAuthorizedWhereClause(ctx, {
      resource: "Equipment",
      targetId: equipmentId,
    });
    const updated = await prisma.equipment.updateMany({
      where,
      data: { isActive },
    });
    if (updated.count === 0) {
      return { success: false, error: "Equipment not found." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Could not update availability." };
  }
}

export interface CreatePartnerFleetEquipmentInput {
  catalogId: string;
  hp: number;
  hourlyRate: number;
  dailyRate: number;
  freeRadiusKm: number;
  transportRatePerKm: number;
  maxRadiusKm: number;
  minBookingHours: number;
  registrationNumber: string;
  operatorName: string;
  operatorPhone: string;
  manufacturingYear: number;
  isActive: boolean;
}

export async function createPartnerFleetEquipmentAction(
  userId: string,
  input: CreatePartnerFleetEquipmentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.equipment.createPartnerFleet({
      userId,
      catalogId: input.catalogId,
      hp: input.hp,
      hourlyRate: input.hourlyRate,
      dailyRate: input.dailyRate,
      freeRadiusKm: input.freeRadiusKm,
      transportRatePerKm: input.transportRatePerKm,
      maxRadiusKm: input.maxRadiusKm,
      minBookingHours: input.minBookingHours,
      registrationNumber: input.registrationNumber,
      operatorName: input.operatorName,
      operatorPhone: input.operatorPhone,
      manufacturingYear: input.manufacturingYear,
      isActive: input.isActive,
    });
    revalidatePath("/fleet");
    revalidatePath("/fleet/new");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add equipment." };
  }
}

export async function submitAddFleetEquipmentFromSession(
  input: AddFleetEquipmentValues
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const payload: CreatePartnerFleetEquipmentInput = {
    catalogId: input.catalogId,
    hp: input.hp,
    hourlyRate: input.hourlyRate,
    dailyRate: input.dailyRate,
    freeRadiusKm: input.freeRadiusKm,
    transportRatePerKm: input.transportRatePerKm,
    maxRadiusKm: input.maxRadiusKm,
    minBookingHours: input.minBookingHours,
    registrationNumber: input.registrationNumber.trim(),
    operatorName: input.operatorName.trim(),
    operatorPhone: input.operatorPhone.trim(),
    manufacturingYear: input.manufacturingYear,
    isActive: input.isActive === "true",
  };

  return createPartnerFleetEquipmentAction(userId, payload);
}

export async function deleteFleetItemAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getResourceAuthzContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const where = getAuthorizedWhereClause(ctx, { resource: "Equipment", targetId: id });
    const row = await prisma.equipment.findFirst({ where, select: { id: true } });
    if (!row) return { success: false, error: "Equipment not found." };

    await prisma.equipment.delete({ where: { id: row.id } });
    revalidatePath("/fleet");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete." };
  }
}

/** Partner-owned equipment row for the edit screen (server-fetched). */
export interface FleetEquipmentEditData {
  id: string;
  name: string;
  categoryLabel: string;
  hp: number;
  hourlyRate: number;
  dailyRate: number;
  freeRadiusKm: number;
  transportRatePerKm: number;
  maxRadiusKm: number;
  minBookingHours: number;
  registrationNumber: string;
  operatorName: string;
  operatorPhone: string;
  manufacturingYear: number;
  isActive: boolean;
  catalog: {
    minHourlyRate: number;
    maxHourlyRate: number;
    minDailyRate: number;
    maxDailyRate: number;
  } | null;
}

export async function getFleetEquipmentForEdit(
  userId: string,
  equipmentId: string
): Promise<FleetEquipmentEditData | null> {
  const session = await auth();
  if (session?.user?.id !== userId) return null;

  const ctx = await getResourceAuthzContext();
  if (!ctx) return null;

  const where = getAuthorizedWhereClause(ctx, {
    resource: "Equipment",
    targetId: equipmentId,
  });
  const e = await prisma.equipment.findFirst({
    where,
    include: {
      catalog: {
        select: {
          minHourlyRate: true,
          maxHourlyRate: true,
          minDailyRate: true,
          maxDailyRate: true,
        },
      },
    },
  });
  if (!e) return null;

  const pricing = e.pricing as { hourly: number; daily: number };
  const y = e.manufacturingYear ?? new Date().getFullYear() - 3;

  return {
    id: e.id,
    name: e.name,
    categoryLabel: e.subType ?? String(e.category),
    hp: e.hp,
    hourlyRate: pricing.hourly / 100,
    dailyRate: pricing.daily / 100,
    freeRadiusKm: e.freeRadiusKm,
    transportRatePerKm: e.transportRatePerKm / 100,
    maxRadiusKm: e.maxRadiusKm,
    minBookingHours: e.minBookingHours,
    registrationNumber: e.registrationNumber?.trim() ?? "",
    operatorName: e.operatorName,
    operatorPhone: e.operatorPhone,
    manufacturingYear: y,
    isActive: e.isActive,
    catalog: e.catalog,
  };
}

export interface UpdatePartnerFleetEquipmentPayload {
  equipmentId: string;
  hp: number;
  hourlyRate: number;
  dailyRate: number;
  freeRadiusKm: number;
  transportRatePerKm: number;
  maxRadiusKm: number;
  minBookingHours: number;
  registrationNumber: string;
  operatorName: string;
  operatorPhone: string;
  manufacturingYear: number;
  isActive: boolean;
}

export async function updatePartnerFleetEquipmentFromSession(
  input: UpdatePartnerFleetEquipmentPayload
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await caller.equipment.updatePartnerFleet({
      userId,
      equipmentId: input.equipmentId,
      hp: input.hp,
      hourlyRate: input.hourlyRate,
      dailyRate: input.dailyRate,
      freeRadiusKm: input.freeRadiusKm,
      transportRatePerKm: input.transportRatePerKm,
      maxRadiusKm: input.maxRadiusKm,
      minBookingHours: input.minBookingHours,
      registrationNumber: input.registrationNumber,
      operatorName: input.operatorName,
      operatorPhone: input.operatorPhone,
      manufacturingYear: input.manufacturingYear,
      isActive: input.isActive,
    });
    revalidatePath("/fleet");
    revalidatePath(`/fleet/${input.equipmentId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update equipment." };
  }
}
