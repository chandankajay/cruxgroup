import { prisma } from "@repo/db";
import { getPartnerServiceBase, getPartnerServiceRadiusKm } from "./partner-geo";

type GeoPoint = { type: "Point"; coordinates: [number, number] };

/**
 * tRPC / legacy API shape: `id` is the **User** id; location mirrors old GeoJSON when parsable.
 */
type PartnerListRow = {
  id: string;
  partnerRecordId: string;
  name: string;
  kind: string;
  phoneNumber: string | null;
  email: string | null;
  baseAddress: string;
  maxServiceRadius: number;
  location: GeoPoint | null;
};

function toApiRow(
  p: {
    id: string;
    kind: string;
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
    partnerRecordId: p.id,
    kind: p.kind,
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
    select: {
      id: true,
      userId: true,
      kind: true,
      companyName: true,
      contactPhone: true,
      address: true,
      maxRadius: true,
      maxServiceRadiusKm: true,
      baseLocation: true,
      baseCoordinates: true,
    },
  });

  const userIds = [...new Set(rows.map((p) => p.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phoneNumber: true, email: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return rows
    .flatMap((p) => {
      const u = userById.get(p.userId);
      const name = u?.name?.trim() || p.companyName?.trim() || "Unnamed Partner";
      const phoneNumber = u?.phoneNumber?.trim() || p.contactPhone?.trim() || null;
      const rowUser = u ?? {
        id: p.userId,
        name,
        phoneNumber,
        email: null as string | null,
      };
      return [toApiRow(p, rowUser)];
    })
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
