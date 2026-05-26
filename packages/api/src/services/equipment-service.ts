import { EquipmentCategory, Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import { calculateDistanceKm } from "@repo/lib";
import {
  getPartnerServiceBase,
  getPartnerServiceRadiusKm,
} from "./partner-geo";

/** Convert rupees from partner/admin forms to integer paise for persistence. */
function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

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
  const hourlyPaise = rupeesToPaise(input.hourlyRate);
  const dailyPaise = rupeesToPaise(input.dailyRate);
  return prisma.equipment.create({
    data: {
      name: input.name,
      category: input.category,
      subType: input.subType,
      hourlyRate: hourlyPaise,
      pricing: { hourly: hourlyPaise, daily: dailyPaise },
      images: input.images,
      specifications: input.specifications as Prisma.InputJsonValue,
      partnerId: input.partnerId ?? null,
      catalogId: input.catalogId ?? null,
      hp: input.hp ?? 0,
      freeRadiusKm: input.freeRadiusKm ?? 5,
      transportRatePerKm: rupeesToPaise(input.transportRatePerKm ?? 0),
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

  const hourlyPaise = rupeesToPaise(input.hourlyRate);
  const dailyPaise = rupeesToPaise(input.dailyRate);
  if (
    hourlyPaise < catalog.minHourlyRate ||
    hourlyPaise > catalog.maxHourlyRate ||
    dailyPaise < catalog.minDailyRate ||
    dailyPaise > catalog.maxDailyRate
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
      hourlyRate: hourlyPaise,
      freeRadiusKm: input.freeRadiusKm,
      transportRatePerKm: rupeesToPaise(input.transportRatePerKm),
      maxRadiusKm: input.maxRadiusKm,
      minBookingHours: input.minBookingHours,
      registrationNumber: reg,
      operatorName: input.operatorName.trim(),
      operatorPhone: input.operatorPhone.trim(),
      manufacturingYear: input.manufacturingYear,
      isActive: input.isActive,
      minDaysForExtendedRadius: 0,
      pricing: { hourly: hourlyPaise, daily: dailyPaise },
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

export interface UpdatePartnerFleetEquipmentInput {
  userId: string;
  equipmentId: string;
  hp: number;
  hourlyRate: number;
  dailyRate: number;
  freeRadiusKm: number;
  transportRatePerKm: number;
  /** Max distance (km) this unit will travel — same semantics as add flow / `maxRadiusKm` in DB */
  maxRadiusKm: number;
  minBookingHours: number;
  registrationNumber: string;
  operatorName: string;
  operatorPhone: string;
  manufacturingYear: number;
  isActive: boolean;
}

export async function updatePartnerFleetEquipment(
  input: UpdatePartnerFleetEquipmentInput
) {
  const partner = await prisma.partner.findUnique({
    where: { userId: input.userId },
  });
  if (!partner) {
    throw new Error("PARTNER_NOT_FOUND");
  }

  const existing = await prisma.equipment.findFirst({
    where: { id: input.equipmentId, partnerId: partner.id },
  });
  if (!existing) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

  let catalog: Awaited<ReturnType<typeof prisma.masterCatalog.findUnique>> = null;
  if (existing.catalogId) {
    catalog = await prisma.masterCatalog.findUnique({
      where: { id: existing.catalogId },
    });
    if (!catalog) {
      throw new Error("CATALOG_NOT_FOUND");
    }
  }

  const hourlyPaise = rupeesToPaise(input.hourlyRate);
  const dailyPaise = rupeesToPaise(input.dailyRate);
  if (catalog) {
    if (
      hourlyPaise < catalog.minHourlyRate ||
      hourlyPaise > catalog.maxHourlyRate ||
      dailyPaise < catalog.minDailyRate ||
      dailyPaise > catalog.maxDailyRate
    ) {
      throw new Error("RATES_OUT_OF_RANGE");
    }
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
        NOT: { id: existing.id },
      },
    });
    if (dup) {
      throw new Error("REGISTRATION_DUPLICATE");
    }
  }

  const prevSpecs =
    existing.specifications !== null &&
    typeof existing.specifications === "object" &&
    !Array.isArray(existing.specifications)
      ? (existing.specifications as Record<string, unknown>)
      : {};

  const catalogSpecs =
    catalog &&
    catalog.specifications !== null &&
    typeof catalog.specifications === "object" &&
    !Array.isArray(catalog.specifications)
      ? (catalog.specifications as Record<string, unknown>)
      : {};

  const mergedSpecs = {
    ...catalogSpecs,
    ...prevSpecs,
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
    ...(catalog ? { catalogName: catalog.name } : {}),
  } as Prisma.InputJsonValue;

  return prisma.equipment.update({
    where: { id: existing.id },
    data: {
      hp: input.hp,
      hourlyRate: hourlyPaise,
      freeRadiusKm: input.freeRadiusKm,
      transportRatePerKm: rupeesToPaise(input.transportRatePerKm),
      maxRadiusKm: input.maxRadiusKm,
      minBookingHours: input.minBookingHours,
      registrationNumber: reg.length > 0 ? reg : null,
      operatorName: input.operatorName.trim(),
      operatorPhone: input.operatorPhone.trim(),
      manufacturingYear: input.manufacturingYear,
      isActive: input.isActive,
      pricing: { hourly: hourlyPaise, daily: dailyPaise },
      specifications: mergedSpecs,
    },
  });
}

// ─── Nearby Equipment (location-aware marketplace) ──────────────────────────

export interface NearbyEquipmentItem {
  catalogId: string;
  catalogName: string;
  category: string;
  imageUrl: string;
  specifications: Record<string, unknown>;
  subType: string | null;
  minDailyRate: number;
  maxDailyRate: number;
  minHourlyRate: number;
  maxHourlyRate: number;
  partnerCount: number;
  /** Individual equipment rows from nearby partners (for booking) */
  partners: {
    equipmentId: string;
    partnerId: string;
    dailyRate: number;
    hourlyRate: number;
    distanceKm: number;
  }[];
}

/**
 * Returns equipment available near a given lat/lng, aggregated by MasterCatalog entry
 * when possible, or by individual equipment row when no catalog link exists.
 * For each catalog item served by multiple nearby partners, returns a price range (min/max).
 */
export async function getNearbyEquipment(lat: number, lng: number) {
  const userLoc = { lat, lng };

  const partners = await prisma.partner.findMany({
    where: { isActive: true, kycStatus: "VERIFIED" },
    select: {
      id: true,
      baseLocation: true,
      baseCoordinates: true,
      maxRadius: true,
      maxServiceRadiusKm: true,
    },
  });

  const nearbyPartnerIds = new Map<string, number>();
  for (const p of partners) {
    const base = getPartnerServiceBase(p);
    if (!base) continue;
    const radiusKm = getPartnerServiceRadiusKm(p);
    if (radiusKm <= 0) continue;
    const distKm = calculateDistanceKm(base, userLoc);
    if (distKm <= radiusKm) {
      nearbyPartnerIds.set(p.id, distKm);
    }
  }

  if (nearbyPartnerIds.size === 0) {
    return [];
  }

  const equipment = await prisma.equipment.findMany({
    where: {
      partnerId: { in: Array.from(nearbyPartnerIds.keys()) },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      category: true,
      subType: true,
      partnerId: true,
      catalogId: true,
      pricing: true,
      hourlyRate: true,
      images: true,
      specifications: true,
    },
  });

  const catalogIds = [...new Set(equipment.map((e) => e.catalogId).filter(Boolean))] as string[];
  const catalogs = catalogIds.length > 0
    ? await prisma.masterCatalog.findMany({ where: { id: { in: catalogIds } } })
    : [];
  const catalogMap = new Map(catalogs.map((c) => [c.id, c]));

  const aggregated = new Map<string, NearbyEquipmentItem>();

  for (const eq of equipment) {
    if (!eq.partnerId) continue;
    const distKm = nearbyPartnerIds.get(eq.partnerId) ?? 0;

    const groupKey = eq.catalogId ?? `eq_${eq.id}`;
    const catalog = eq.catalogId ? catalogMap.get(eq.catalogId) : null;

    let entry = aggregated.get(groupKey);
    if (!entry) {
      const rawSpecs = catalog?.specifications ?? eq.specifications;
      const specs =
        rawSpecs != null &&
        typeof rawSpecs === "object" &&
        !Array.isArray(rawSpecs)
          ? (rawSpecs as Record<string, unknown>)
          : {};
      entry = {
        catalogId: groupKey,
        catalogName: catalog?.name ?? eq.name,
        category: catalog?.category ?? eq.category,
        imageUrl: catalog?.imageUrl ?? (eq.images.length > 0 ? eq.images[0]! : ""),
        specifications: specs,
        subType: eq.subType,
        minDailyRate: eq.pricing.daily,
        maxDailyRate: eq.pricing.daily,
        minHourlyRate: eq.pricing.hourly,
        maxHourlyRate: eq.pricing.hourly,
        partnerCount: 0,
        partners: [],
      };
      aggregated.set(groupKey, entry);
    }

    entry.minDailyRate = Math.min(entry.minDailyRate, eq.pricing.daily);
    entry.maxDailyRate = Math.max(entry.maxDailyRate, eq.pricing.daily);
    entry.minHourlyRate = Math.min(entry.minHourlyRate, eq.pricing.hourly);
    entry.maxHourlyRate = Math.max(entry.maxHourlyRate, eq.pricing.hourly);
    entry.partnerCount += 1;

    if (eq.images.length > 0 && !entry.imageUrl) {
      entry.imageUrl = eq.images[0]!;
    }

    entry.partners.push({
      equipmentId: eq.id,
      partnerId: eq.partnerId,
      dailyRate: eq.pricing.daily,
      hourlyRate: eq.pricing.hourly,
      distanceKm: Number(distKm.toFixed(2)),
    });
  }

  const result = Array.from(aggregated.values());
  result.sort((a, b) => {
    const aMinDist = Math.min(...a.partners.map((p) => p.distanceKm));
    const bMinDist = Math.min(...b.partners.map((p) => p.distanceKm));
    return aMinDist - bMinDist;
  });

  return result;
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

  const nextHourlyPaise =
    input.hourlyRate !== undefined
      ? rupeesToPaise(input.hourlyRate)
      : existing.pricing.hourly;
  const nextDailyPaise =
    input.dailyRate !== undefined
      ? rupeesToPaise(input.dailyRate)
      : existing.pricing.daily;

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
      ...((input.hourlyRate !== undefined || input.dailyRate !== undefined) && {
        hourlyRate: nextHourlyPaise,
        pricing: {
          hourly: nextHourlyPaise,
          daily: nextDailyPaise,
        },
      }),
    },
  });
}

