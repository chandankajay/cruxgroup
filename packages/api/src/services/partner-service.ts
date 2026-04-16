import { prisma } from "@repo/db";

export async function listPartners() {
  return prisma.user.findMany({
    where: { role: "PARTNER" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      email: true,
      baseAddress: true,
      location: true,
      maxServiceRadius: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPartnerById(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "PARTNER" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      email: true,
      baseAddress: true,
      location: true,
      maxServiceRadius: true,
    },
  });
}

interface UpdateServiceAreaInput {
  id: string;
  lat: number;
  lng: number;
  maxServiceRadius: number;
  baseAddress?: string;
}

export async function updatePartnerServiceArea(input: UpdateServiceAreaInput) {
  return prisma.user.update({
    where: { id: input.id },
    data: {
      location: {
        type: "Point",
        coordinates: [input.lng, input.lat],
      },
      maxServiceRadius: input.maxServiceRadius,
      ...(input.baseAddress !== undefined && {
        baseAddress: input.baseAddress,
      }),
    },
    select: {
      id: true,
      name: true,
      location: true,
      maxServiceRadius: true,
      baseAddress: true,
    },
  });
}
