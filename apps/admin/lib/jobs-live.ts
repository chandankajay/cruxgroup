import type { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import { sendPartnerJobOverrunAlert } from "@repo/lib/aisensy";
import type { LiveJobsPayload, LiveTripJobDto } from "./job-board-types";

/** Grace after planned end before flagging OVERRUN (1 hour). */
export const OVERRUN_GRACE_MS = 60 * 60 * 1000;

const LIVE_STATUSES = ["SCHEDULED", "ENROUTE", "ON_SITE", "OVERRUN"] as const;

const invoiceInclude = {
  take: 1,
  select: {
    id: true,
    invoiceNumber: true,
    pdfUrl: true,
    payments: {
      orderBy: { createdAt: "desc" as const },
      take: 1,
      select: { paymentLinkUrl: true },
    },
  },
} as const;

export type { LiveJobsPayload, LiveTripJobDto };

function jobLocationLabel(jobLocation: Prisma.JsonValue): string {
  if (jobLocation === null || typeof jobLocation !== "object" || Array.isArray(jobLocation)) {
    return "—";
  }
  const o = jobLocation as Record<string, unknown>;
  if (typeof o.address === "string" && o.address.trim()) return o.address;
  if (typeof o.lat === "number" && typeof o.lng === "number") {
    return `${o.lat.toFixed(4)}, ${o.lng.toFixed(4)}`;
  }
  return "—";
}

function toDto(
  trip: {
    id: string;
    bookingId: string | null;
    status: string;
    scheduledDate: Date;
    expectedEndTime: Date | null;
    actualStartTime: Date | null;
    actualEndTime: Date | null;
    jobLocation: Prisma.JsonValue;
    equipment: { name: string; category: string; operatorName: string; operatorPhone: string };
    user: { name: string; phoneNumber: string | null };
    partner: { companyName: string };
    invoices?: {
      id: string;
      invoiceNumber: string;
      pdfUrl: string | null;
      payments: { paymentLinkUrl: string | null }[];
    }[];
  }
): LiveTripJobDto {
  const inv = trip.invoices?.[0];
  const invoice =
    inv != null
      ? {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          pdfUrl: inv.pdfUrl,
          paymentLinkUrl: inv.payments[0]?.paymentLinkUrl ?? null,
        }
      : null;

  return {
    id: trip.id,
    bookingId: trip.bookingId,
    status: trip.status,
    scheduledDate: trip.scheduledDate.toISOString(),
    expectedEndTime: trip.expectedEndTime?.toISOString() ?? null,
    actualStartTime: trip.actualStartTime?.toISOString() ?? null,
    actualEndTime: trip.actualEndTime?.toISOString() ?? null,
    machine: { name: trip.equipment.name, category: trip.equipment.category },
    operator: {
      name: trip.equipment.operatorName || "—",
      phone: trip.equipment.operatorPhone || "—",
    },
    customer: {
      name: trip.user.name || "—",
      phone: trip.user.phoneNumber || "—",
    },
    partnerCompany: trip.partner.companyName || "Partner",
    locationLabel: jobLocationLabel(trip.jobLocation),
    invoice,
  };
}

/**
 * Marks trips as OVERRUN when now > expectedEnd + 1h and status is still pre-completion.
 * Sends one WhatsApp alert per transition (partner primary phone).
 */
export async function syncTripOverruns(): Promise<void> {
  const now = Date.now();
  const candidates = await prisma.trip.findMany({
    where: {
      status: { in: ["SCHEDULED", "ENROUTE", "ON_SITE"] },
      expectedEndTime: { not: null },
    },
    include: {
      equipment: {
        select: {
          name: true,
          category: true,
          operatorName: true,
          operatorPhone: true,
        },
      },
      user: { select: { name: true, phoneNumber: true } },
      partner: {
        select: {
          companyName: true,
          user: { select: { phoneNumber: true } },
        },
      },
    },
  });

  for (const trip of candidates) {
    const end = trip.expectedEndTime!.getTime();
    if (now <= end + OVERRUN_GRACE_MS) continue;

    // Only transition status — never touch actualStartTime / actualEndTime so billed hours stay
    // anchored to real OTP start when the operator later completes from OVERRUN.
    const updated = await prisma.trip.updateMany({
      where: {
        id: trip.id,
        status: { in: ["SCHEDULED", "ENROUTE", "ON_SITE"] },
      },
      data: { status: "OVERRUN" },
    });

    if (updated.count === 0) continue;

    const partnerPhone = trip.partner.user.phoneNumber;
    if (!partnerPhone?.trim()) continue;

    const jobLabel = `${trip.equipment.category} ${trip.equipment.name}`.trim();
    const expectedEndIstLabel = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(trip.expectedEndTime!);

    await sendPartnerJobOverrunAlert({
      partnerPhone,
      companyName: trip.partner.companyName || "Partner",
      jobLabel,
      expectedEndIstLabel,
      machineName: trip.equipment.name,
      customerName: trip.user.name || "Customer",
    });
  }
}

export async function getLiveJobsPayload(partnerId?: string): Promise<LiveJobsPayload> {
  const partnerFilter = partnerId ? { equipment: { partnerId } } : {};

  const [liveRows, recentRows] = await Promise.all([
    prisma.trip.findMany({
      where: { status: { in: [...LIVE_STATUSES] }, ...partnerFilter },
      orderBy: { scheduledDate: "desc" },
      take: 80,
      include: {
        equipment: {
          select: {
            name: true,
            category: true,
            operatorName: true,
            operatorPhone: true,
          },
        },
        user: { select: { name: true, phoneNumber: true } },
        partner: { select: { companyName: true } },
        invoices: invoiceInclude,
      },
    }),
    prisma.trip.findMany({
      where: { status: "COMPLETED", ...partnerFilter },
      orderBy: { actualEndTime: "desc" },
      take: 25,
      include: {
        equipment: {
          select: {
            name: true,
            category: true,
            operatorName: true,
            operatorPhone: true,
          },
        },
        user: { select: { name: true, phoneNumber: true } },
        partner: { select: { companyName: true } },
        invoices: invoiceInclude,
      },
    }),
  ]);

  return {
    live: liveRows.map(toDto),
    recentCompleted: recentRows.map(toDto),
  };
}
