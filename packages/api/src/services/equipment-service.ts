import { prisma } from "@repo/db";
import type { EquipmentCategory } from "@repo/db";

export async function listEquipment() {
  return prisma.equipment.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listEquipmentByPartner(partnerId: string) {
  return prisma.equipment.findMany({
    where: { partnerId },
    orderBy: { name: "asc" },
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
      specifications: input.specifications,
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
        specifications: input.specifications,
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
