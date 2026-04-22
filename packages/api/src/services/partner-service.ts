import { prisma } from "@repo/db";
import { getPartnerServiceBase, getPartnerServiceRadiusKm } from "./partner-geo";

type GeoPoint = { type: "Point"; coordinates: [number, number] };

/**
 * tRPC / legacy API shape: `id` is the **User** id; location mirrors old GeoJSON when parsable.
 */
type PartnerListRow = {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  baseAddress: string;
  maxServiceRadius: number;
  location: GeoPoint | null;
};

function toApiRow(
  p: {
    id: string;
    address: string;
    maxRadius: number;
    maxServiceRadiusKm: number | null;
    baseLocation: string | null;
    baseCoordinates: import("@repo/db").Prisma.JsonValue;
  },
  u: { id: string; name: string; phoneNumber: string | null; email: string | null }
): PartnerListRow {
  const base = getPartnerServiceBase(p);
  const r = getPartnerServiceRadiusKm(p);
  return {
    id: u.id,
    name: u.name,
    phoneNumber: u.phoneNumber,
    email: u.email,
    baseAddress: p.address,
    maxServiceRadius: r,
    location: base
      ? { type: "Point" as const, coordinates: [base.lng, base.lat] as [number, number] }
      : null,
  };
}

export async function listPartners() {
  const rows = await prisma.partner.findMany({
    include: {
      user: { select: { id: true, name: true, phoneNumber: true, email: true } },
    },
  });

  return rows
    .map((p) => toApiRow(p, p.user))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export async function getPartnerById(userId: string) {
  const p = await prisma.partner.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, phoneNumber: true, email: true } } },
  });
  if (!p) return null;
  return toApiRow(p, p.user);
}

interface UpdateServiceAreaInput {
  id: string;
  lat: number;
  lng: number;
  maxServiceRadius: number;
  baseAddress?: string;
}

export async function updatePartnerServiceArea(input: UpdateServiceAreaInput) {
  const baseLocation = `${input.lat},${input.lng}`;

  const p = await prisma.partner.update({
    where: { userId: input.id },
    data: {
      maxRadius: input.maxServiceRadius,
      maxServiceRadiusKm: input.maxServiceRadius,
      baseLocation,
      baseCoordinates: { lat: input.lat, lng: input.lng },
      ...(input.baseAddress !== undefined && { address: input.baseAddress }),
    },
    include: { user: { select: { id: true, name: true, phoneNumber: true, email: true } } },
  });

  return toApiRow(p, p.user);
}
