"use server";

import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { sendOperatorSalarySlipWhatsApp } from "@repo/lib/aisensy";
import { z } from "zod";
import { auth } from "../../../lib/auth";
import {
  clampAdvanceRecoveryPaise,
  completedTripsForMonthWhere,
  computeOperatorWorkingDayKeys,
  grossPayPaise,
  netPayablePaise,
  type TripWithEquipment,
} from "../../../lib/payroll/compute-payroll";
import { buildMusterRollCsv } from "../../../lib/payroll/muster-csv";
import { buildSalarySlipPdfBytes } from "../../../lib/payroll/salary-slip-pdf";

async function requireAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" || !session?.user?.id) return null;
  return { userId: session.user.id };
}

const monthParams = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

const previewSchema = monthParams.extend({
  operatorId: z.string().min(1),
});

const finalizeSchema = previewSchema.extend({
  deductionPaise: z.number().int().min(0),
  advanceRecoveryPaise: z.number().int().min(0),
});

function monthLabel(month1: number): string {
  return new Date(2000, month1 - 1, 1).toLocaleString("en-IN", { month: "long" });
}

function inrLabelFromPaise(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function loadTripsForPayrollMonth(year: number, month: number): Promise<TripWithEquipment[]> {
  return prisma.trip.findMany({
    where: completedTripsForMonthWhere(year, month),
    include: { equipment: { select: { operatorPhone: true } } },
  }) as Promise<TripWithEquipment[]>;
}

export type PayrollOperatorRow = {
  userId: string;
  name: string;
  phone: string | null;
  dailyRatePaise: number;
  pfApplicable: boolean;
  advanceBalancePaise: number;
};

export async function listPayrollOperators(): Promise<PayrollOperatorRow[] | null> {
  if (!(await requireAdmin())) return null;

  const profiles = await prisma.operatorProfile.findMany({
    include: {
      user: { select: { id: true, name: true, phoneNumber: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return profiles.map((p) => ({
    userId: p.user.id,
    name: p.user.name || "Operator",
    phone: p.user.phoneNumber ?? null,
    dailyRatePaise: p.dailyRate,
    pfApplicable: p.pfApplicable,
    advanceBalancePaise: p.advanceBalance,
  }));
}

export type PayrollPreviewResult = {
  operatorId: string;
  operatorName: string;
  year: number;
  month: number;
  daysWorked: number;
  dailyRatePaise: number;
  grossPayPaise: number;
  deductionPaise: number;
  advanceRecoveryPaise: number;
  netPayablePaise: number;
  advanceBalancePaise: number;
  tripIds: string[];
  existingPdfUrl: string | null;
};

export async function previewPayrollAction(
  raw: z.infer<typeof previewSchema>
): Promise<{ ok: true; data: PayrollPreviewResult } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const parsed = previewSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month, operatorId } = parsed.data;

  const profile = await prisma.operatorProfile.findUnique({
    where: { userId: operatorId },
    include: { user: { select: { name: true, phoneNumber: true } } },
  });
  if (!profile) return { ok: false, error: "Operator not found" };

  const trips = await loadTripsForPayrollMonth(year, month);
  const { dayKeys, tripIds } = computeOperatorWorkingDayKeys(
    trips,
    profile.user.phoneNumber,
    year,
    month
  );
  const daysWorked = dayKeys.length;
  const gross = grossPayPaise(daysWorked, profile.dailyRate);

  const existing = await prisma.payrollEntry.findUnique({
    where: {
      operatorId_year_month: { operatorId, year, month },
    },
  });

  const deductionPaise = existing?.deductionPaise ?? 0;
  const advanceRecoveryPaise = existing?.advanceRecoveryPaise ?? 0;
  const net = netPayablePaise(gross, deductionPaise, advanceRecoveryPaise);

  return {
    ok: true,
    data: {
      operatorId,
      operatorName: profile.user.name || "Operator",
      year,
      month,
      daysWorked,
      dailyRatePaise: profile.dailyRate,
      grossPayPaise: gross,
      deductionPaise,
      advanceRecoveryPaise,
      netPayablePaise: net,
      advanceBalancePaise: profile.advanceBalance,
      tripIds,
      existingPdfUrl: existing?.pdfUrl ?? null,
    },
  };
}

export async function finalizePayrollAction(
  raw: z.infer<typeof finalizeSchema>
): Promise<
  | { ok: true; pdfUrl: string | null; netPayablePaise: number; notifyFailed?: boolean }
  | { ok: false; error: string }
> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Forbidden" };

  const parsed = finalizeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month, operatorId, deductionPaise, advanceRecoveryPaise: requestedRecovery } =
    parsed.data;

  const profile = await prisma.operatorProfile.findUnique({
    where: { userId: operatorId },
    include: { user: { select: { name: true, phoneNumber: true } } },
  });
  if (!profile) return { ok: false, error: "Operator not found" };

  const phone = profile.user.phoneNumber;
  if (!phone?.trim()) return { ok: false, error: "Operator has no phone on file" };

  const previousEntry = await prisma.payrollEntry.findUnique({
    where: { operatorId_year_month: { operatorId, year, month } },
  });
  const prevRecovery = previousEntry?.advanceRecoveryPaise ?? 0;

  const trips = await loadTripsForPayrollMonth(year, month);
  const { dayKeys } = computeOperatorWorkingDayKeys(trips, phone, year, month);
  const daysWorked = dayKeys.length;
  const gross = grossPayPaise(daysWorked, profile.dailyRate);

  const effectiveRecovery = clampAdvanceRecoveryPaise({
    requested: requestedRecovery,
    advanceBalancePaise: profile.advanceBalance,
    priorRecoveryForMonthPaise: prevRecovery,
    grossPaise: gross,
    deductionPaise,
  });

  const net = netPayablePaise(gross, deductionPaise, effectiveRecovery);

  const periodLabel = `${monthLabel(month)} ${year}`;

  const pdfBytes = await buildSalarySlipPdfBytes({
    operatorName: profile.user.name || "Operator",
    monthLabel: monthLabel(month),
    year,
    month,
    daysWorked,
    dailyRatePaise: profile.dailyRate,
    grossPayPaise: gross,
    deductionPaise,
    advanceRecoveryPaise: effectiveRecovery,
    netPayablePaise: net,
    pfApplicable: profile.pfApplicable,
  });

  const blobPath = `payroll/${year}/${month}/${operatorId}/salary-slip.pdf`;
  let pdfUrl: string | null = null;
  try {
    const blob = await put(blobPath, new Blob([pdfBytes], { type: "application/pdf" }), {
      access: "public",
      contentType: "application/pdf",
    });
    pdfUrl = blob.url;
  } catch (e) {
    console.error("[payroll] blob upload failed", e);
    return { ok: false, error: "PDF upload failed" };
  }

  await prisma.$transaction(async (tx) => {
    const beforeAdj = await tx.payrollEntry.findUnique({
      where: { operatorId_year_month: { operatorId, year, month } },
    });
    const prevFromEntry = beforeAdj?.advanceRecoveryPaise ?? 0;

    await tx.payrollEntry.upsert({
      where: {
        operatorId_year_month: { operatorId, year, month },
      },
      create: {
        operatorId,
        year,
        month,
        daysWorked,
        grossPay: gross,
        deductionPaise,
        advanceRecoveryPaise: effectiveRecovery,
        netPayable: net,
        pdfUrl,
      },
      update: {
        daysWorked,
        grossPay: gross,
        deductionPaise,
        advanceRecoveryPaise: effectiveRecovery,
        netPayable: net,
        pdfUrl,
      },
    });

    const prof = await tx.operatorProfile.findUnique({
      where: { userId: operatorId },
    });
    if (prof) {
      const adjustedAdvance = Math.max(0, prof.advanceBalance + prevFromEntry - effectiveRecovery);
      await tx.operatorProfile.update({
        where: { userId: operatorId },
        data: { advanceBalance: adjustedAdvance },
      });
    }
  });

  let notifyFailed = false;
  try {
    const sent = await sendOperatorSalarySlipWhatsApp({
      operatorPhone: phone,
      periodLabel,
      operatorName: profile.user.name || "Operator",
      netInrLabel: inrLabelFromPaise(net),
      pdfUrl: pdfUrl ?? "",
    });
    if (!sent) notifyFailed = true;
  } catch (e) {
    console.error("[payroll] WhatsApp notification failed after payroll commit", e);
    notifyFailed = true;
  }

  return {
    ok: true,
    pdfUrl,
    netPayablePaise: net,
    ...(notifyFailed ? { notifyFailed: true } : {}),
  };
}

/** Save computed payroll and advance recovery without generating a PDF or WhatsApp. */
export async function savePayrollDraftAction(
  raw: z.infer<typeof finalizeSchema>
): Promise<{ ok: true; netPayablePaise: number } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const parsed = finalizeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month, operatorId, deductionPaise, advanceRecoveryPaise: requestedRecovery } =
    parsed.data;

  const profile = await prisma.operatorProfile.findUnique({
    where: { userId: operatorId },
    include: { user: { select: { phoneNumber: true } } },
  });
  if (!profile) return { ok: false, error: "Operator not found" };

  const beforeRow = await prisma.payrollEntry.findUnique({
    where: { operatorId_year_month: { operatorId, year, month } },
  });
  const prevRecoveryForClamp = beforeRow?.advanceRecoveryPaise ?? 0;

  const trips = await loadTripsForPayrollMonth(year, month);
  const { dayKeys } = computeOperatorWorkingDayKeys(
    trips,
    profile.user.phoneNumber,
    year,
    month
  );
  const daysWorked = dayKeys.length;
  const gross = grossPayPaise(daysWorked, profile.dailyRate);

  const effectiveRecovery = clampAdvanceRecoveryPaise({
    requested: requestedRecovery,
    advanceBalancePaise: profile.advanceBalance,
    priorRecoveryForMonthPaise: prevRecoveryForClamp,
    grossPaise: gross,
    deductionPaise,
  });

  const net = netPayablePaise(gross, deductionPaise, effectiveRecovery);

  await prisma.$transaction(async (tx) => {
    const before = await tx.payrollEntry.findUnique({
      where: { operatorId_year_month: { operatorId, year, month } },
    });
    const prevRecovery = before?.advanceRecoveryPaise ?? 0;

    await tx.payrollEntry.upsert({
      where: { operatorId_year_month: { operatorId, year, month } },
      create: {
        operatorId,
        year,
        month,
        daysWorked,
        grossPay: gross,
        deductionPaise,
        advanceRecoveryPaise: effectiveRecovery,
        netPayable: net,
        pdfUrl: null,
      },
      update: {
        daysWorked,
        grossPay: gross,
        deductionPaise,
        advanceRecoveryPaise: effectiveRecovery,
        netPayable: net,
        ...(before?.pdfUrl != null ? { pdfUrl: before.pdfUrl } : {}),
      },
    });

    const prof = await tx.operatorProfile.findUnique({
      where: { userId: operatorId },
    });
    if (prof) {
      const adjustedAdvance = Math.max(0, prof.advanceBalance + prevRecovery - effectiveRecovery);
      await tx.operatorProfile.update({
        where: { userId: operatorId },
        data: { advanceBalance: adjustedAdvance },
      });
    }
  });

  return { ok: true, netPayablePaise: net };
}

export async function exportMusterRollCsvAction(
  raw: z.infer<typeof monthParams>
): Promise<{ ok: true; csv: string; filename: string } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const parsed = monthParams.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month } = parsed.data;

  const operators = await prisma.operatorProfile.findMany({
    include: { user: { select: { id: true, name: true, phoneNumber: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const cols = operators.map((p) => ({
    userId: p.user.id,
    name: p.user.name || "Operator",
  }));

  const userPhoneById = new Map(
    operators.map((p) => [p.user.id, p.user.phoneNumber] as const)
  );

  const trips = await prisma.trip.findMany({
    where: completedTripsForMonthWhere(year, month),
    include: { equipment: { select: { operatorPhone: true } } },
  });

  const csv = buildMusterRollCsv(
    year,
    month,
    cols,
    trips.map((t) => ({
      actualStartTime: t.actualStartTime,
      actualEndTime: t.actualEndTime,
      equipment: { operatorPhone: t.equipment.operatorPhone },
    })),
    userPhoneById
  );

  const filename = `muster-roll-${year}-${String(month).padStart(2, "0")}.csv`;
  return { ok: true, csv, filename };
}
