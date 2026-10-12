"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { createCaller } from "@repo/api";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";
import { normalizeAdminPhone } from "../../../../lib/phone";

const caller = createCaller({});

export type PassivePartnerRow = {
  partnerId: string;
  companyName: string;
  contactPhone: string;
  address: string;
  baseLocation: string | null;
  maxServiceRadiusKm: number;
  internalNotes: string | null;
  gstNumber: string | null;
  equipmentCount: number;
  activatedAt: string | null;
};

export async function fetchPassivePartners(): Promise<PassivePartnerRow[] | null> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return null;

  const rows = await prisma.partner.findMany({
    where: { kind: "PASSIVE" },
    include: {
      _count: { select: { equipment: true } },
    },
    orderBy: { companyName: "asc" },
  });

  return rows.map((p) => ({
    partnerId: p.id,
    companyName: p.companyName,
    contactPhone: p.contactPhone,
    address: p.address,
    baseLocation: p.baseLocation,
    maxServiceRadiusKm: p.maxServiceRadiusKm ?? p.maxRadius,
    internalNotes: p.internalNotes,
    gstNumber: p.gstNumber,
    equipmentCount: p._count.equipment,
    activatedAt: p.activatedAt?.toISOString() ?? null,
  }));
}

export async function createPassivePartnerAction(input: {
  companyName: string;
  contactPhone: string;
  address: string;
  lat: number;
  lng: number;
  maxServiceRadiusKm: number;
  internalNotes?: string;
  gstNumber?: string;
}): Promise<{ ok: true; partnerId: string } | { ok: false; error: string }> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const phone = normalizeAdminPhone(input.contactPhone);
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Valid contact phone is required" };
  }

  const companyName = input.companyName.trim();
  if (companyName.length < 2) return { ok: false, error: "Company name is required" };

  try {
    const partner = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phoneNumber: phone },
        create: {
          phoneNumber: phone,
          name: companyName,
          role: "PARTNER",
        },
        update: { name: companyName, role: "PARTNER" },
        select: { id: true },
      });

      const existing = await tx.partner.findUnique({ where: { userId: user.id } });
      if (existing) {
        throw new Error("A partner profile already exists for this phone number");
      }

      return tx.partner.create({
        data: {
          userId: user.id,
          kind: "PASSIVE",
          contactPhone: phone,
          companyName,
          address: input.address.trim(),
          baseLocation: `${input.lat},${input.lng}`,
          baseCoordinates: { lat: input.lat, lng: input.lng },
          maxRadius: input.maxServiceRadiusKm,
          maxServiceRadiusKm: input.maxServiceRadiusKm,
          internalNotes: input.internalNotes?.trim() || null,
          gstNumber: input.gstNumber?.trim() || null,
        },
        select: { id: true },
      });
    });

    revalidatePath("/platform-admin/partners/passive");
    return { ok: true, partnerId: partner.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create partner" };
  }
}

export async function updatePassivePartnerAction(input: {
  partnerId: string;
  companyName: string;
  contactPhone: string;
  address: string;
  lat: number;
  lng: number;
  maxServiceRadiusKm: number;
  internalNotes?: string;
  gstNumber?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const phone = normalizeAdminPhone(input.contactPhone);

  try {
    await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({
        where: { id: input.partnerId, kind: "PASSIVE" },
        select: { userId: true },
      });
      if (!partner) throw new Error("Passive partner not found");

      await tx.user.update({
        where: { id: partner.userId },
        data: { phoneNumber: phone, name: input.companyName.trim() },
      });

      await tx.partner.update({
        where: { id: input.partnerId },
        data: {
          contactPhone: phone,
          companyName: input.companyName.trim(),
          address: input.address.trim(),
          baseLocation: `${input.lat},${input.lng}`,
          baseCoordinates: { lat: input.lat, lng: input.lng },
          maxRadius: input.maxServiceRadiusKm,
          maxServiceRadiusKm: input.maxServiceRadiusKm,
          internalNotes: input.internalNotes?.trim() || null,
          gstNumber: input.gstNumber?.trim() || null,
        },
      });
    });

    revalidatePath("/platform-admin/partners/passive");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function addPassivePartnerEquipmentAction(
  partnerId: string,
  input: {
    catalogId: string;
    operatorName: string;
    operatorPhone: string;
    hourlyRate: number;
    dailyRate: number;
    registrationNumber?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId, kind: "PASSIVE" },
    select: { userId: true },
  });
  if (!partner) return { ok: false, error: "Passive partner not found" };

  try {
    await caller.equipment.createPartnerFleet({
      userId: partner.userId,
      catalogId: input.catalogId,
      hp: 0,
      hourlyRate: input.hourlyRate,
      dailyRate: input.dailyRate,
      freeRadiusKm: 5,
      transportRatePerKm: 0,
      maxRadiusKm: 50,
      minBookingHours: 1,
      registrationNumber: input.registrationNumber?.trim() || `PASSIVE-${Date.now()}`,
      operatorName: input.operatorName.trim(),
      operatorPhone: normalizeAdminPhone(input.operatorPhone),
      manufacturingYear: new Date().getFullYear(),
      isActive: true,
    });
    revalidatePath("/platform-admin/partners/passive");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not add equipment",
    };
  }
}

export async function fetchAssignablePartners(): Promise<
  { id: string; companyName: string; contactPhone: string; baseLocation: string | null; kind: string }[]
> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return [];

  const rows = await prisma.partner.findMany({
    where: { isActive: true },
    select: {
      id: true,
      userId: true,
      kind: true,
      companyName: true,
      contactPhone: true,
      baseLocation: true,
    },
    orderBy: { companyName: "asc" },
  });

  const userIds = [...new Set(rows.map((p) => p.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, phoneNumber: true },
  });
  const userPhoneById = new Map(users.map((u) => [u.id, u.phoneNumber]));

  return rows.map((p) => ({
    id: p.id,
    companyName: p.companyName || "Unnamed",
    contactPhone: p.contactPhone?.trim() || userPhoneById.get(p.userId)?.trim() || "",
    baseLocation: p.baseLocation,
    kind: p.kind,
  }));
}

export async function fetchPartnerFleetOptions(partnerId: string) {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return [];

  const rows = await prisma.equipment.findMany({
    where: { partnerId, isActive: true },
    include: {
      catalog: { select: { name: true, category: true } },
      partner: { select: { companyName: true, baseLocation: true } },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    partnerId: e.partnerId!,
    hourlyBase: e.hourlyRate > 0 ? e.hourlyRate : e.pricing.hourly,
    dailyBase: e.pricing.daily,
    catalogName: e.catalog?.name ?? null,
    operatorPhone: e.operatorPhone,
    operatorName: e.operatorName,
    partnerBaseLocation: e.partner?.baseLocation ?? null,
  }));
}
