import "server-only";

import type { BookingStatus } from "@repo/db";
import { prisma } from "@repo/db";

export type TripStatus =
  | "SCHEDULED"
  | "ENROUTE"
  | "ON_SITE"
  | "COMPLETED"
  | "OVERRUN"
  | "CANCELLED"
  | "DISPUTED";

/** B2C rows are owned by `Booking.userId` (platform user). `customerId` is CRM-only. */
export type MyBookingCardData = {
  readonly id: string;
  readonly equipmentName: string;
  readonly yardLabel: string | null;
  readonly totalInrLabel: string;
  readonly status: BookingStatus;
  readonly dateLabel: string;
  readonly tripStatus: TripStatus | null;
  readonly trackUrl: string | null;
  readonly invoices: readonly {
    readonly invoiceNumber: string;
    readonly paymentStatus: string;
    readonly amountInrLabel: string;
  }[];
};

const ACTIVE: BookingStatus[] = ["PENDING", "CONFIRMED", "DISPATCHED"];
const PAST: BookingStatus[] = ["COMPLETED", "CANCELLED"];

function sortTimeMs(b: {
  trips: { scheduledDate: Date }[];
  startDate: Date | null;
  createdAt: Date;
}): number {
  const tripMs = b.trips.map((t) => t.scheduledDate.getTime());
  if (tripMs.length > 0) return Math.max(...tripMs);
  if (b.startDate) return b.startDate.getTime();
  return b.createdAt.getTime();
}

function formatInrFromPaise(paise: number): string {
  const inr = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inr);
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

function toCardData(b: {
  id: string;
  status: BookingStatus;
  pricing: { total: number };
  quoteAmount: number | null;
  startDate: Date | null;
  createdAt: Date;
  equipment: { name: string; partner: { companyName: string } | null };
  trips: {
    id: string;
    status: TripStatus;
    scheduledDate: Date;
    partner: { companyName: string };
    invoices: { invoiceNumber: string; paymentStatus: string; amount: number }[];
  }[];
}): MyBookingCardData {
  const tripDates = b.trips.map((t) => t.scheduledDate);
  const primaryDate =
    tripDates.length > 0
      ? new Date(Math.max(...tripDates.map((d) => d.getTime())))
      : (b.startDate ?? b.createdAt);

  const fromTrip = b.trips
    .map((t) => t.partner?.companyName?.trim())
    .find((n) => n && n.length > 0);
  const yard =
    fromTrip ||
    b.equipment.partner?.companyName?.trim() ||
    null;

  const totalPaise = b.quoteAmount ?? b.pricing.total;

  const invoices = b.trips.flatMap((t) =>
    t.invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      paymentStatus: inv.paymentStatus,
      amountInrLabel: formatInrFromPaise(inv.amount),
    })),
  );

  const latestTrip = b.trips.length > 0
    ? b.trips.reduce((latest, t) =>
        t.scheduledDate > latest.scheduledDate ? t : latest
      )
    : null;

  return {
    id: b.id,
    equipmentName: b.equipment.name,
    yardLabel: yard || null,
    totalInrLabel: formatInrFromPaise(totalPaise),
    status: b.status,
    dateLabel: formatDateIst(primaryDate),
    tripStatus: (latestTrip?.status as TripStatus) ?? null,
    trackUrl: latestTrip ? `/track/${latestTrip.id}` : null,
    invoices,
  };
}

export async function fetchMyBookingsForUser(userId: string): Promise<{
  active: MyBookingCardData[];
  past: MyBookingCardData[];
}> {
  const rows = await prisma.booking.findMany({
    where: { userId },
    include: {
      equipment: {
        select: {
          name: true,
          partner: { select: { companyName: true } },
        },
      },
      trips: {
        orderBy: { scheduledDate: "desc" },
        select: {
          id: true,
          status: true,
          scheduledDate: true,
          partner: { select: { companyName: true } },
          invoices: {
            select: {
              invoiceNumber: true,
              paymentStatus: true,
              amount: true,
            },
          },
        },
      },
    },
  });

  const sorted = [...rows].sort((a, b) => sortTimeMs(b) - sortTimeMs(a));

  const activeRaw = sorted.filter((b) => ACTIVE.includes(b.status));
  const pastRaw = sorted.filter((b) => PAST.includes(b.status));

  return {
    active: activeRaw.map(toCardData),
    past: pastRaw.map(toCardData),
  };
}
