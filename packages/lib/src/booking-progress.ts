import { prisma } from "@repo/db";
import type { BookingProgressStage, BookingStatus } from "@repo/db";
import {
  sendBookingProgressWhatsApp,
  type BookingProgressWhatsAppStage,
} from "./aisensy";

type TripStatus =
  | "SCHEDULED"
  | "ENROUTE"
  | "ON_SITE"
  | "COMPLETED"
  | "OVERRUN"
  | "CANCELLED"
  | "DISPUTED";

const STAGE_ORDER: BookingProgressStage[] = [
  "BOOKING_RECEIVED",
  "BOOKING_CONFIRMED",
  "MACHINE_ASSIGNED",
  "ON_SITE",
  "JOB_COMPLETED",
];

function stageIndex(stage: BookingProgressStage): number {
  return STAGE_ORDER.indexOf(stage);
}

/** Minimum customer-facing stage implied by internal booking/trip status. */
function impliedProgressStage(
  status: BookingStatus,
  tripStatus: TripStatus | null,
): BookingProgressStage {
  if (tripStatus === "COMPLETED" || status === "COMPLETED") return "JOB_COMPLETED";
  if (tripStatus === "ON_SITE" || tripStatus === "OVERRUN") return "ON_SITE";
  if (tripStatus === "ENROUTE" || status === "DISPATCHED") return "MACHINE_ASSIGNED";
  if (status === "PARTNER_ACCEPTED" || status === "CONFIRMED") return "BOOKING_CONFIRMED";
  return "BOOKING_RECEIVED";
}

async function reconcileBookingProgress(
  bookingId: string,
  status: BookingStatus,
  tripStatus: TripStatus | null,
): Promise<void> {
  const implied = impliedProgressStage(status, tripStatus);
  const impliedIdx = stageIndex(implied);

  for (const stage of STAGE_ORDER) {
    if (stageIndex(stage) > impliedIdx) break;
    await advanceBookingProgress(bookingId, stage, "Synced from booking status", {
      silent: true,
    });
  }
}

function formatDateIst(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  }).format(d);
}

function categoryLabel(raw: string): string {
  return raw.replaceAll("_", " ");
}

/**
 * Advance a booking's customer-facing progress stage, log the transition, and notify via WhatsApp.
 * Skips if the booking is already at or past the target stage.
 */
export async function advanceBookingProgress(
  bookingId: string,
  stage: BookingProgressStage,
  note?: string,
  options?: { silent?: boolean },
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      progressStage: true,
      startDate: true,
      createdAt: true,
      user: { select: { phoneNumber: true, name: true } },
      equipment: { select: { name: true, category: true, operatorName: true } },
      customer: { select: { phone: true, name: true } },
    },
  });

  if (!booking) return;

  const currentIdx = stageIndex(booking.progressStage ?? "BOOKING_RECEIVED");
  const targetIdx = stageIndex(stage);
  if (targetIdx <= currentIdx) return;

  const now = new Date();

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { progressStage: stage },
    }),
    prisma.bookingProgressLog.create({
      data: {
        bookingId,
        stage,
        timestamp: now,
        note: note ?? null,
      },
    }),
  ]);

  const customerPhone =
    booking.customer?.phone?.trim() || booking.user.phoneNumber?.trim();
  if (!customerPhone || options?.silent) return;

  const machineType =
    `${categoryLabel(booking.equipment.category)} ${booking.equipment.name}`.trim();
  const date = formatDateIst(booking.startDate ?? booking.createdAt);
  const operatorName =
    booking.equipment.operatorName?.trim() || "Your operator";

  void sendBookingProgressWhatsApp({
    customerPhone,
    stage: stage as BookingProgressWhatsAppStage,
    machineType,
    date,
    operatorName,
  }).catch((err) =>
    console.error("[booking-progress] whatsapp_failed", {
      bookingId,
      stage,
      error: err instanceof Error ? err.message : String(err),
    }),
  );
}

export type BookingProgressPayload = {
  progressStage: BookingProgressStage;
  bookingStatus: BookingStatus;
  progressHistory: {
    stage: BookingProgressStage;
    timestamp: string;
    note: string | null;
  }[];
};

export async function fetchBookingProgress(
  bookingId: string,
  userId: string,
): Promise<BookingProgressPayload | null> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: {
      status: true,
      trips: {
        orderBy: { scheduledDate: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });

  if (!booking) return null;

  const tripStatus = (booking.trips[0]?.status as TripStatus | undefined) ?? null;

  try {
    await reconcileBookingProgress(bookingId, booking.status, tripStatus);
  } catch (err) {
    console.error("[fetchBookingProgress] reconcile_failed", {
      bookingId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const updated = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: {
      status: true,
      progressStage: true,
      progressLogs: {
        orderBy: { timestamp: "asc" },
        select: { stage: true, timestamp: true, note: true },
      },
    },
  });

  if (!updated) return null;

  return {
    progressStage: updated.progressStage ?? "BOOKING_RECEIVED",
    bookingStatus: updated.status,
    progressHistory: updated.progressLogs.map((log) => ({
      stage: log.stage,
      timestamp: log.timestamp.toISOString(),
      note: log.note,
    })),
  };
}
