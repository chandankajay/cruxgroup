import { EquipmentCategory, Prisma } from "@prisma/client";
import { prisma } from "@repo/db";

export function mapCatalogCategoryToEquipmentCategory(
  category: string
): EquipmentCategory {
  const c = category.toLowerCase();
  if (c.includes("crane") || c.includes("lift")) {
    return EquipmentCategory.Crane;
  }
  if (c.includes("excavat")) {
    return EquipmentCategory.Excavator;
  }
  return EquipmentCategory.JCB;
}

export async function listEquipment() {
  return prisma.equipment.findMany({
    orderBy: { name: "asc" },
  });
}

/** Resolves logged-in user id or raw Partner.id for listing partner-linked rows. */
export async function listEquipmentByPartner(partnerIdOrUserId: string) {
  const partner = await prisma.partner.findUnique({
    where: { userId: partnerIdOrUserId },
  });
  const or: Prisma.EquipmentWhereInput[] = [
    { partnerId: partnerIdOrUserId },
  ];
  if (partner) {
    or.push({ partnerId: partner.id });
  }
  return prisma.equipment.findMany({
    where: { OR: or },
    orderBy: { name: "asc" },
    include: {
      partner: {
        select: { kycStatus: true },
      },
    },
  });
}

export async function getEquipmentById(id: string) {
  return prisma.equipment.findUnique({ where: { id } });
}

export async function searchEquipment(query: string) {
  return prisma.equipment.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { category: { equals: query.toUpperCase() as never } },
      ],
    },
    orderBy: { name: "asc" },
  });
}

interface CreateEquipmentInput {
  name: string;
  category: EquipmentCategory;
  subType?: string;
  hourlyRate: number;
  dailyRate: number;
  images: string[];
  specifications: Record<string, unknown>;
  partnerId?: string | null;
  catalogId?: string | null;
  hp?: number;
  freeRadiusKm?: number;
  transportRatePerKm?: number;
}

export async function createEquipment(input: CreateEquipmentInput) {
  return prisma.equipment.create({
    data: {
      name: input.name,
      category: input.category,
      subType: input.subType,
      hourlyRate: input.hourlyRate,
      pricing: { hourly: input.hourlyRate, daily: input.dailyRate },
      images: input.images,
      specifications: input.specifications as Prisma.InputJsonValue,
      partnerId: input.partnerId ?? null,
      catalogId: input.catalogId ?? null,
      hp: input.hp ?? 0,
      freeRadiusKm: input.freeRadiusKm ?? 5,
      transportRatePerKm: input.transportRatePerKm ?? 0,
    },
  });
}

export interface CreatePartnerFleetEquipmentInput {
  userId: string;
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

export async function createPartnerFleetEquipment(
  input: CreatePartnerFleetEquipmentInput
) {
  const partner = await prisma.partner.findUnique({
    where: { userId: input.userId },
  });
  if (!partner) {
    throw new Error("PARTNER_NOT_FOUND");
  }

  const catalog = await prisma.masterCatalog.findUnique({
    where: { id: input.catalogId },
  });
  if (!catalog) {
    throw new Error("CATALOG_NOT_FOUND");
  }

  if (
    input.hourlyRate < catalog.minHourlyRate ||
    input.hourlyRate > catalog.maxHourlyRate ||
    input.dailyRate < catalog.minDailyRate ||
    input.dailyRate > catalog.maxDailyRate
  ) {
    throw new Error("RATES_OUT_OF_RANGE");
  }

  if (input.freeRadiusKm > input.maxRadiusKm) {
    throw new Error("RADIUS_INVALID");
  }

  const reg = input.registrationNumber.trim();
  if (reg.length > 0) {
    const dup = await prisma.equipment.findFirst({
      where: {
        partnerId: partner.id,
        registrationNumber: reg,
      },
    });
    if (dup) {
      throw new Error("REGISTRATION_DUPLICATE");
    }
  }

  const catalogSpecs =
    catalog.specifications !== null &&
    typeof catalog.specifications === "object" &&
    !Array.isArray(catalog.specifications)
      ? (catalog.specifications as Record<string, unknown>)
      : {};

  const images =
    catalog.imageUrl && catalog.imageUrl.length > 0 ? [catalog.imageUrl] : [];

  return prisma.equipment.create({
    data: {
      name: catalog.name,
      category: mapCatalogCategoryToEquipmentCategory(catalog.category),
      subType: catalog.category,
      partnerId: partner.id,
      catalogId: catalog.id,
      hp: input.hp,
      hourlyRate: input.hourlyRate,
      freeRadiusKm: input.freeRadiusKm,
      transportRatePerKm: input.transportRatePerKm,
      maxRadiusKm: input.maxRadiusKm,
      minBookingHours: input.minBookingHours,
      registrationNumber: reg,
      operatorName: input.operatorName.trim(),
      operatorPhone: input.operatorPhone.trim(),
      manufacturingYear: input.manufacturingYear,
      isActive: input.isActive,
      minDaysForExtendedRadius: 0,
      pricing: { hourly: input.hourlyRate, daily: input.dailyRate },
      images,
      specifications: {
        ...catalogSpecs,
        hp: input.hp,
        freeRadiusKm: input.freeRadiusKm,
        transportRatePerKm: input.transportRatePerKm,
        maxRadiusKm: input.maxRadiusKm,
        minBookingHours: input.minBookingHours,
        registrationNumber: reg,
        operatorName: input.operatorName.trim(),
        operatorPhone: input.operatorPhone.trim(),
        manufacturingYear: input.manufacturingYear,
        isActive: input.isActive,
        catalogName: catalog.name,
      } as Prisma.InputJsonValue,
    },
  });
}

interface UpdateEquipmentInput {
  id: string;
  name?: string;
  category?: EquipmentCategory;
  subType?: string | null;
  hourlyRate?: number;
  dailyRate?: number;
  images?: string[];
  specifications?: Record<string, unknown>;
}

export async function updateEquipment(input: UpdateEquipmentInput) {
  const existing = await prisma.equipment.findUnique({
    where: { id: input.id },
  });

  if (!existing) throw new Error("Equipment not found");

  return prisma.equipment.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.subType !== undefined && { subType: input.subType }),
      ...(input.images !== undefined && { images: input.images }),
      ...(input.specifications !== undefined && {
        specifications: input.specifications as Prisma.InputJsonValue,
      }),
      ...(input.hourlyRate !== undefined && { hourlyRate: input.hourlyRate }),
      ...((input.hourlyRate !== undefined || input.dailyRate !== undefined) && {
        pricing: {
          hourly: input.hourlyRate ?? existing.pricing.hourly,
          daily: input.dailyRate ?? existing.pricing.daily,
        },
      }),
    },
  });
}

export async function deleteEquipment(id: string) {
  return prisma.equipment.delete({ where: { id } });
}
