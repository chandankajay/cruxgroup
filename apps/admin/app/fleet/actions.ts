"use server";

import type { KycStatus } from "@prisma/client";
import { createCaller } from "@repo/api";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";
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
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true, kycStatus: true },
    });
    if (!partner) return { success: false, error: "Partner not found." };
    if (partner.kycStatus !== "VERIFIED") {
      return { success: false, error: "Complete KYC verification to change availability." };
    }

    const owned = await prisma.equipment.findFirst({
      where: { id: equipmentId, partnerId: partner.id },
      select: { id: true },
    });
    if (!owned) return { success: false, error: "Equipment not found." };

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { isActive },
    });
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
    await caller.equipment.delete({ id });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete." };
  }
}
