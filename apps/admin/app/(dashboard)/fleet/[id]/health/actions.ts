"use server";

import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { sendPartnerMachineServiceDueWhatsApp } from "@repo/lib/aisensy";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../../../../lib/auth";
import {
  computeMachineHealthScore,
  nextServiceDueHours,
} from "../../../../../lib/fleet-health/health-score";

async function requireAdmin(): Promise<{ userId: string; name: string | null } | null> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" || !session?.user?.id) return null;
  const name = (session.user as { name?: string | null }).name ?? null;
  return { userId: session.user.id, name };
}

const MAX_BREAKDOWN_BYTES = 5 * 1024 * 1024;
const BREAKDOWN_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

async function sumHourMeter(machineId: string): Promise<number> {
  const agg = await prisma.hourMeterEntry.aggregate({
    where: { machineId },
    _sum: { recordedHours: true },
  });
  return agg._sum.recordedHours ?? 0;
}

async function maybeSendServiceApproachAlert(
  equipmentId: string,
  prevTotalHours: number,
  newTotalHours: number
): Promise<void> {
  const eq = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      partner: {
        include: { user: { select: { phoneNumber: true } } },
      },
    },
  });
  if (!eq?.partnerId || !eq.partner) return;

  const phone = eq.partner.user.phoneNumber?.trim();
  if (!phone) return;

  const nextDue = nextServiceDueHours(eq.lastServiceHourReading, eq.serviceIntervalHours);
  const alertLine = nextDue - eq.serviceAlertBeforeHours;

  const crossedIntoWindow =
    prevTotalHours < alertLine && newTotalHours >= alertLine && newTotalHours < nextDue;

  if (!crossedIntoWindow) return;

  const hoursUntil = Math.max(0, nextDue - newTotalHours);
  const fmt = (h: number) =>
    h.toLocaleString("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

  await sendPartnerMachineServiceDueWhatsApp({
    partnerPhone: phone,
    companyName: eq.partner.companyName || "Partner",
    machineName: eq.name,
    totalHoursLabel: `${fmt(newTotalHours)} h`,
    hoursUntilDueLabel: `${fmt(hoursUntil)} h`,
  });

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { lastMaintenanceAlertSentAt: new Date() },
  });
}

export type MachineHealthPageData = {
  id: string;
  name: string;
  category: string;
  serviceIntervalHours: number;
  serviceAlertBeforeHours: number;
  lastServiceHourReading: number;
  totalHours: number;
  nextDueHours: number;
  healthScore: number;
  hourEntries: {
    id: string;
    recordedHours: number;
    reportedBy: string;
    createdAt: Date;
  }[];
  breakdowns: {
    id: string;
    description: string;
    photoUrl: string | null;
    reportedAt: Date;
    resolvedAt: Date | null;
  }[];
  serviceLogs: {
    id: string;
    serviceType: string;
    date: Date;
    cost: number;
    vendor: string;
    hourMeterAtService: number | null;
    createdAt: Date;
  }[];
};

export async function fetchMachineHealthPageData(
  equipmentId: string
): Promise<MachineHealthPageData | null> {
  if (!(await requireAdmin())) return null;

  const eq = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      hourMeterEntries: { orderBy: { createdAt: "desc" }, take: 50 },
      breakdownReports: { orderBy: { reportedAt: "desc" }, take: 50 },
      machineServiceLogs: { orderBy: { date: "desc" }, take: 50 },
    },
  });
  if (!eq) return null;

  const totalHours = await sumHourMeter(equipmentId);
  const nextDue = nextServiceDueHours(eq.lastServiceHourReading, eq.serviceIntervalHours);

  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);

  const openBreakdowns = eq.breakdownReports.filter((b) => b.resolvedAt == null).length;
  const breakdowns90 = eq.breakdownReports.filter((b) => b.reportedAt >= since90).length;

  const healthScore = computeMachineHealthScore({
    totalHours,
    nextDueHours: nextDue,
    openBreakdownCount: openBreakdowns,
    breakdownsLast90Days: breakdowns90,
  });

  return {
    id: eq.id,
    name: eq.name,
    category: eq.category,
    serviceIntervalHours: eq.serviceIntervalHours,
    serviceAlertBeforeHours: eq.serviceAlertBeforeHours,
    lastServiceHourReading: eq.lastServiceHourReading,
    totalHours,
    nextDueHours: nextDue,
    healthScore,
    hourEntries: eq.hourMeterEntries.map((h) => ({
      id: h.id,
      recordedHours: h.recordedHours,
      reportedBy: h.reportedBy,
      createdAt: h.createdAt,
    })),
    breakdowns: eq.breakdownReports.map((b) => ({
      id: b.id,
      description: b.description,
      photoUrl: b.photoUrl,
      reportedAt: b.reportedAt,
      resolvedAt: b.resolvedAt,
    })),
    serviceLogs: eq.machineServiceLogs.map((s) => ({
      id: s.id,
      serviceType: s.serviceType,
      date: s.date,
      cost: s.cost,
      vendor: s.vendor,
      hourMeterAtService: s.hourMeterAtService ?? null,
      createdAt: s.createdAt,
    })),
  };
}

const settingsSchema = z.object({
  equipmentId: z.string().min(1),
  serviceIntervalHours: z.number().int().min(1).max(20000),
  serviceAlertBeforeHours: z.number().int().min(0).max(500),
});

export async function updateMachineServiceSettingsAction(
  raw: z.infer<typeof settingsSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  await prisma.equipment.update({
    where: { id: parsed.data.equipmentId },
    data: {
      serviceIntervalHours: parsed.data.serviceIntervalHours,
      serviceAlertBeforeHours: parsed.data.serviceAlertBeforeHours,
    },
  });
  revalidatePath(`/fleet/${parsed.data.equipmentId}/health`);
  return { ok: true };
}

const hourMeterSchema = z.object({
  equipmentId: z.string().min(1),
  recordedHours: z.number().positive().max(1_000_000),
});

export async function addHourMeterEntryAction(
  raw: z.infer<typeof hourMeterSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Forbidden" };
  const parsed = hourMeterSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const prevTotal = await sumHourMeter(parsed.data.equipmentId);

  await prisma.hourMeterEntry.create({
    data: {
      machineId: parsed.data.equipmentId,
      recordedHours: parsed.data.recordedHours,
      reportedBy: gate.name?.trim() || "Admin",
    },
  });

  const newTotal = prevTotal + parsed.data.recordedHours;
  await maybeSendServiceApproachAlert(parsed.data.equipmentId, prevTotal, newTotal);

  revalidatePath(`/fleet/${parsed.data.equipmentId}/health`);
  return { ok: true };
}

export async function addBreakdownReportAction(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const equipmentId = String(formData.get("equipmentId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("photo");

  if (!equipmentId || !description) {
    return { ok: false, error: "Equipment and description are required." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Photo is required." };
  }
  if (file.size > MAX_BREAKDOWN_BYTES) {
    return { ok: false, error: "Photo must be 5MB or smaller." };
  }
  if (!BREAKDOWN_MIME.includes(file.type as (typeof BREAKDOWN_MIME)[number])) {
    return { ok: false, error: "Photo must be JPEG, PNG, or WebP." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const pathname = `breakdowns/${equipmentId}/${Date.now()}-${safeName}`;
  let photoUrl: string;
  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });
    photoUrl = blob.url;
  } catch (e) {
    console.error("[breakdown upload]", e);
    return { ok: false, error: "Upload failed. Check blob configuration." };
  }

  await prisma.breakdownReport.create({
    data: {
      machineId: equipmentId,
      description,
      photoUrl,
    },
  });

  revalidatePath(`/fleet/${equipmentId}/health`);
  return { ok: true };
}

const serviceLogSchema = z.object({
  equipmentId: z.string().min(1),
  serviceType: z.string().min(1).max(120),
  vendor: z.string().min(1).max(200),
  dateIso: z.string().min(1),
  costPaise: z.number().int().min(0),
  hourMeterAtService: z.number().min(0).optional(),
  updateBaseline: z.boolean().optional(),
});

export async function addMachineServiceLogAction(
  raw: z.infer<typeof serviceLogSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const parsed = serviceLogSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const date = new Date(parsed.data.dateIso);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };

  const hourMeter =
    parsed.data.updateBaseline && parsed.data.hourMeterAtService != null
      ? parsed.data.hourMeterAtService
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.machineServiceLog.create({
      data: {
        machineId: parsed.data.equipmentId,
        serviceType: parsed.data.serviceType,
        date,
        cost: parsed.data.costPaise,
        vendor: parsed.data.vendor,
        hourMeterAtService: hourMeter ?? null,
      },
    });

    if (hourMeter != null) {
      await tx.equipment.update({
        where: { id: parsed.data.equipmentId },
        data: { lastServiceHourReading: hourMeter },
      });
    }
  });

  revalidatePath(`/fleet/${parsed.data.equipmentId}/health`);
  return { ok: true };
}

const resolveBreakdownSchema = z.object({
  breakdownId: z.string().min(1),
  equipmentId: z.string().min(1),
});

export async function resolveBreakdownAction(
  raw: z.infer<typeof resolveBreakdownSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const parsed = resolveBreakdownSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const r = await prisma.breakdownReport.updateMany({
    where: { id: parsed.data.breakdownId, machineId: parsed.data.equipmentId },
    data: { resolvedAt: new Date() },
  });
  if (r.count === 0) return { ok: false, error: "Not found" };
  revalidatePath(`/fleet/${parsed.data.equipmentId}/health`);
  return { ok: true };
}
