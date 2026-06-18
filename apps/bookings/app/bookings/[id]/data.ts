import "server-only";

import { prisma } from "@repo/db";
import { fetchBookingProgress } from "@repo/lib";

const OBJECT_ID = /^[a-f\d]{24}$/i;

export type BookingDetailPayload = {
  id: string;
  equipmentName: string;
  dateLabel: string;
  totalInrLabel: string;
  status: string;
  progressStage: import("@prisma/client").BookingProgressStage;
  progressHistory: {
    stage: import("@prisma/client").BookingProgressStage;
    timestamp: string;
    note: string | null;
  }[];
};

function formatInrFromPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatDateIst(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function fetchBookingDetailForCustomer(
  bookingId: string,
  userId: string,
): Promise<BookingDetailPayload | null> {
  if (!OBJECT_ID.test(bookingId)) return null;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: {
      id: true,
      status: true,
      startDate: true,
      createdAt: true,
      quoteAmount: true,
      pricing: true,
      equipment: { select: { name: true } },
    },
  });

  if (!booking) return null;

  const progress = await fetchBookingProgress(bookingId, userId);
  if (!progress) return null;

  const primaryDate = booking.startDate ?? booking.createdAt;
  const totalPaise = booking.quoteAmount ?? booking.pricing.total;

  return {
    id: booking.id,
    equipmentName: booking.equipment.name,
    dateLabel: formatDateIst(primaryDate),
    totalInrLabel: formatInrFromPaise(totalPaise),
    status: booking.status,
    progressStage: progress.progressStage,
    progressHistory: progress.progressHistory,
  };
}
