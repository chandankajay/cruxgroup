import "server-only";

import type { EquipmentCategory, Prisma } from "@prisma/client";
import { prisma } from "@repo/db";

function mapCatalogCategoryToEquipmentCategory(category: string): EquipmentCategory {
  const c = category.toLowerCase();
  if (c.includes("crane") || c.includes("lift")) return "Crane";
  if (c.includes("excavat")) return "Excavator";
  return "JCB";
}

/**
 * Historical past jobs may use master catalog when the partner has no fleet rows.
 * Reuses an existing partner+catalog equipment row or creates a minimal passive row.
 */
export async function ensureHistoricalEquipment(params: {
  partnerId: string;
  catalogId: string;
  equipmentId?: string;
}): Promise<string> {
  const partner = await prisma.partner.findUnique({
    where: { id: params.partnerId },
    select: {
      id: true,
      companyName: true,
      contactPhone: true,
      user: { select: { phoneNumber: true } },
    },
  });
  if (!partner) throw new Error("Partner not found");

  if (params.equipmentId?.trim()) {
    const row = await prisma.equipment.findFirst({
      where: { id: params.equipmentId.trim(), partnerId: partner.id },
      select: { id: true },
    });
    if (row) return row.id;
  }

  const catalog = await prisma.masterCatalog.findUnique({
    where: { id: params.catalogId },
  });
  if (!catalog) throw new Error("Select a machine type from the master catalog");

  const existing = await prisma.equipment.findFirst({
    where: { partnerId: partner.id, catalogId: catalog.id, isActive: true },
    select: { id: true },
    orderBy: { id: "desc" },
  });
  if (existing) return existing.id;

  const hourlyPaise =
    catalog.minHourlyRate > 0
      ? Math.round((catalog.minHourlyRate + catalog.maxHourlyRate) / 2)
      : catalog.maxHourlyRate;
  const dailyPaise =
    catalog.minDailyRate > 0
      ? Math.round((catalog.minDailyRate + catalog.maxDailyRate) / 2)
      : catalog.maxDailyRate;

  const operatorPhone =
    partner.contactPhone?.trim() || partner.user.phoneNumber?.trim() || "";
  const reg = `HIST-${Date.now()}`;

  const created = await prisma.equipment.create({
    data: {
      name: catalog.name,
      category: mapCatalogCategoryToEquipmentCategory(catalog.category),
      subType: catalog.category,
      partnerId: partner.id,
      catalogId: catalog.id,
      hp: 0,
      hourlyRate: hourlyPaise,
      freeRadiusKm: 5,
      transportRatePerKm: 0,
      maxRadiusKm: 50,
      minBookingHours: 1,
      registrationNumber: reg,
      operatorName: partner.companyName || "Operator",
      operatorPhone,
      manufacturingYear: new Date().getFullYear(),
      isActive: true,
      pricing: { hourly: hourlyPaise, daily: dailyPaise },
      images: catalog.imageUrl ? [catalog.imageUrl] : [],
      specifications:
        catalog.specifications !== null &&
        typeof catalog.specifications === "object" &&
        !Array.isArray(catalog.specifications)
          ? (catalog.specifications as Prisma.InputJsonValue)
          : {},
    },
    select: { id: true },
  });

  return created.id;
}
