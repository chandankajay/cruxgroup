import "server-only";

import { prisma } from "@repo/db";

const OBJECT_ID = /^[a-f\d]{24}$/i;

export type LiveTripPayload = {
  id: string;
  status: import("@prisma/client").TripStatus;
  scheduledDate: string;
  expectedEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  distanceKm: number;
  partnerYard: string;
  equipment: {
    name: string;
    category: string;
    subType: string | null;
    registrationNumber: string | null;
    operatorName: string;
    hp: number;
  };
};

export async function fetchTripForCustomer(
  tripId: string,
  userId: string
): Promise<LiveTripPayload | null> {
  if (!OBJECT_ID.test(tripId)) return null;

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: {
      id: true,
      status: true,
      scheduledDate: true,
      expectedEndTime: true,
      actualStartTime: true,
      actualEndTime: true,
      distanceKm: true,
      partner: { select: { companyName: true } },
      equipment: {
        select: {
          name: true,
          category: true,
          subType: true,
          registrationNumber: true,
          operatorName: true,
          hp: true,
        },
      },
    },
  });

  if (!trip) return null;

  return {
    id: trip.id,
    status: trip.status,
    scheduledDate: trip.scheduledDate.toISOString(),
    expectedEndTime: trip.expectedEndTime?.toISOString() ?? null,
    actualStartTime: trip.actualStartTime?.toISOString() ?? null,
    actualEndTime: trip.actualEndTime?.toISOString() ?? null,
    distanceKm: trip.distanceKm,
    partnerYard: trip.partner.companyName?.trim() || "Partner yard",
    equipment: {
      name: trip.equipment.name,
      category: trip.equipment.category,
      subType: trip.equipment.subType,
      registrationNumber: trip.equipment.registrationNumber,
      operatorName: trip.equipment.operatorName?.trim() || "Assigned operator",
      hp: trip.equipment.hp,
    },
  };
}
