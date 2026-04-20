import { prisma } from "./client";

const IST_MS = 330 * 60 * 1000;

function istMidnightUtc(y: number, month1: number, day: number): Date {
  return new Date(Date.UTC(y, month1 - 1, day, 0, 0, 0, 0) - IST_MS);
}

function istMonthRangeUtc(now: Date): { startInclusive: Date; endExclusive: Date; y: number; m: number } {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const [yStr, mStr] = key.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const startInclusive = istMidnightUtc(y, m, 1);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const endExclusive = istMidnightUtc(nextY, nextM, 1);
  return { startInclusive, endExclusive, y, m };
}

function istDayOfMonth(d: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
    }).format(d)
  );
}

function outstandingPaise(inv: {
  amount: number;
  payments: { amountPaid: number; status: string }[];
}): number {
  const paid = inv.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amountPaid, 0);
  return Math.max(0, inv.amount - paid);
}

export type PartnerHeatmapRow = {
  equipmentId: string;
  name: string;
  /** Index `i` = day `i + 1` of the month */
  dayFlags: boolean[];
  daysInMonth: number;
};

export type PartnerTopCustomerRow = {
  label: string;
  revenuePaise: number;
};

export type PartnerBusinessDashboard = {
  monthlyRevenuePaise: number;
  collectionRatePct: number | null;
  overdueReceivablesPaise: number;
  topCustomers: PartnerTopCustomerRow[];
  activeTrips: number;
  fleetUtilizationPct: number;
  heatmap: PartnerHeatmapRow[];
  idleMachines: { id: string; name: string }[];
};

/**
 * Partner BI snapshot: revenue, collection, overdue, top customers, utilization heatmap, idle fleet.
 * All money fields in paise. Pass `now` for tests only.
 */
export async function getPartnerBusinessDashboard(
  partnerId: string,
  now: Date = new Date()
): Promise<PartnerBusinessDashboard> {
  const { startInclusive, endExclusive, y, m } = istMonthRangeUtc(now);
  const dim = new Date(y, m, 0).getDate();

  const overdueCutoff = new Date(now);
  overdueCutoff.setUTCDate(overdueCutoff.getUTCDate() - 7);

  const [
    paymentsMonth,
    invoicesAll,
    unpaidOverdue,
    activeTrips,
    tripsMonth,
    equipmentList,
    recentBookingEquipmentIds,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startInclusive, lt: endExclusive },
        invoice: { trip: { partnerId } },
      },
      select: { amountPaid: true },
    }),
    prisma.invoice.findMany({
      where: { trip: { partnerId } },
      select: {
        amount: true,
        payments: { select: { amountPaid: true, status: true } },
      },
    }),
    prisma.invoice.findMany({
      where: {
        paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },
        createdAt: { lt: overdueCutoff },
        trip: { partnerId },
      },
      include: {
        payments: { select: { amountPaid: true, status: true } },
      },
    }),
    prisma.trip.count({
      where: {
        partnerId,
        status: { in: ["SCHEDULED", "ENROUTE", "ON_SITE", "OVERRUN"] },
      },
    }),
    prisma.trip.findMany({
      where: {
        partnerId,
        status: { notIn: ["CANCELLED"] },
        scheduledDate: { gte: startInclusive, lt: endExclusive },
      },
      select: {
        equipmentId: true,
        scheduledDate: true,
      },
    }),
    prisma.equipment.findMany({
      where: { partnerId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        equipment: { partnerId },
        status: { not: "CANCELLED" },
        createdAt: {
          gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      select: { equipmentId: true },
    }),
  ]);

  const monthlyRevenuePaise = paymentsMonth.reduce((s, p) => s + p.amountPaid, 0);

  let totalInvoicedPaise = 0;
  let totalCollectedPaise = 0;
  for (const inv of invoicesAll) {
    totalInvoicedPaise += inv.amount;
    totalCollectedPaise += inv.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((s, p) => s + p.amountPaid, 0);
  }
  const collectionRatePct =
    totalInvoicedPaise > 0
      ? Math.min(100, Math.round((totalCollectedPaise / totalInvoicedPaise) * 1000) / 10)
      : null;

  const overdueReceivablesPaise = unpaidOverdue.reduce((s, inv) => s + outstandingPaise(inv), 0);

  const paymentsForTop = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: startInclusive, lt: endExclusive },
      invoice: { trip: { partnerId } },
    },
    select: {
      amountPaid: true,
      invoice: {
        select: {
          trip: {
            select: {
              booking: { select: { customer: { select: { name: true, company: true } } } },
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const byLabel = new Map<string, number>();
  for (const p of paymentsForTop) {
    const cust = p.invoice.trip.booking?.customer;
    const label =
      cust != null
        ? [cust.name, cust.company].filter(Boolean).join(" · ") || "Customer"
        : p.invoice.trip.user?.name?.trim() || "Walk-in / direct";
    byLabel.set(label, (byLabel.get(label) ?? 0) + p.amountPaid);
  }
  const topCustomers: PartnerTopCustomerRow[] = [...byLabel.entries()]
    .map(([label, revenuePaise]) => ({ label, revenuePaise }))
    .sort((a, b) => b.revenuePaise - a.revenuePaise)
    .slice(0, 3);

  const bookedByEquipment = new Map<string, Set<number>>();
  for (const t of tripsMonth) {
    const dom = istDayOfMonth(t.scheduledDate);
    if (dom < 1 || dom > dim) continue;
    if (!bookedByEquipment.has(t.equipmentId)) {
      bookedByEquipment.set(t.equipmentId, new Set());
    }
    bookedByEquipment.get(t.equipmentId)!.add(dom);
  }

  const heatmap: PartnerHeatmapRow[] = equipmentList.map((eq) => {
    const days = new Set(bookedByEquipment.get(eq.id) ?? []);
    const dayFlags = Array.from({ length: dim }, (_, i) => days.has(i + 1));
    return {
      equipmentId: eq.id,
      name: eq.name,
      dayFlags,
      daysInMonth: dim,
    };
  });

  let utilSum = 0;
  let utilN = 0;
  for (const row of heatmap) {
    const booked = row.dayFlags.filter(Boolean).length;
    utilSum += dim > 0 ? booked / dim : 0;
    utilN += 1;
  }
  const fleetUtilizationPct =
    utilN > 0 ? Math.round((utilSum / utilN) * 1000) / 10 : 0;

  const recentSet = new Set(
    recentBookingEquipmentIds.map((b) => b.equipmentId).filter(Boolean)
  );
  const idleMachines = equipmentList
    .filter((eq) => !recentSet.has(eq.id))
    .map((eq) => ({ id: eq.id, name: eq.name }));

  return {
    monthlyRevenuePaise,
    collectionRatePct,
    overdueReceivablesPaise,
    topCustomers,
    activeTrips,
    fleetUtilizationPct,
    heatmap,
    idleMachines,
  };
}
