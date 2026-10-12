"use server";

import { revalidatePath } from "next/cache";
import type { ServiceLeadStage } from "@prisma/client";
import { prisma } from "@repo/db";
import {
  SERVICE_LEAD_STAGES,
  type ServiceLeadStageId,
} from "@repo/lib/service-leads";
import {
  markQuotationSentSchema,
  updateServiceLeadStageSchema,
} from "@repo/validators/service-lead-stage";
import { logLeadActivity } from "../../../lib/lead-activity";
import {
  requireAdminSession,
  requireSalesSession,
  sessionCanSendQuotes,
} from "../../../lib/sales-auth";

const BASE_PATH = "/services-leads";

function revalidateServicesLeads() {
  revalidatePath(BASE_PATH);
  revalidatePath("/sales/leads");
}

export type ServiceLeadCard = {
  id: string;
  name: string;
  phoneNumber: string;
  serviceSlug: string | null;
  areaLabel: string | null;
  landSize: string | null;
  source: string;
  serviceStage: ServiceLeadStage;
  salesPersonId: string | null;
  salesPersonName: string | null;
  quoteAmountPaise: number | null;
  billbookRef: string | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceLeadFilters = {
  area?: string;
  serviceSlug?: string;
  salesPersonId?: string;
  search?: string;
};

function serviceLeadWhere(filters: ServiceLeadFilters) {
  const search = filters.search?.trim();
  return {
    leadType: "SERVICE" as const,
    ...(filters.serviceSlug ? { serviceSlug: filters.serviceSlug } : {}),
    ...(filters.salesPersonId
      ? filters.salesPersonId === "unassigned"
        ? { salesPersonId: null }
        : { salesPersonId: filters.salesPersonId }
      : {}),
    ...(filters.area
      ? { areaLabel: { contains: filters.area, mode: "insensitive" as const } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phoneNumber: { contains: search } },
            { areaLabel: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function fetchServiceLeadsBoard(
  filters: ServiceLeadFilters,
): Promise<Record<ServiceLeadStageId, ServiceLeadCard[]> | null> {
  const admin = await requireAdminSession();
  if (!admin) return null;

  const leads = await prisma.lead.findMany({
    where: serviceLeadWhere(filters),
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      serviceSlug: true,
      areaLabel: true,
      landSize: true,
      source: true,
      serviceStage: true,
      salesPersonId: true,
      salesPerson: { select: { name: true } },
      quoteAmountPaise: true,
      billbookRef: true,
      lostReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const board: Record<ServiceLeadStageId, ServiceLeadCard[]> = {
    NEW: [],
    SITE_VISIT_SCHEDULED: [],
    SITE_VISIT_DONE: [],
    QUOTATION_SENT: [],
    QUOTE_ACCEPTED: [],
    ADVANCE_RECEIVED: [],
    COMPLETED: [],
    LOST: [],
  };

  for (const lead of leads) {
    const stage = (lead.serviceStage ?? "NEW") as ServiceLeadStageId;
    if (!(SERVICE_LEAD_STAGES as readonly string[]).includes(stage)) continue;
    board[stage].push({
      id: lead.id,
      name: lead.name,
      phoneNumber: lead.phoneNumber,
      serviceSlug: lead.serviceSlug,
      areaLabel: lead.areaLabel,
      landSize: lead.landSize,
      source: lead.source,
      serviceStage: stage,
      salesPersonId: lead.salesPersonId,
      salesPersonName: lead.salesPerson?.name ?? null,
      quoteAmountPaise: lead.quoteAmountPaise,
      billbookRef: lead.billbookRef,
      lostReason: lead.lostReason,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    });
  }

  return board;
}

export async function fetchAssignableSalespeople(): Promise<
  { id: string; name: string; assignedAreaSlugs: string[]; openCount: number }[] | null
> {
  const admin = await requireAdminSession();
  if (!admin) return null;

  const users = await prisma.user.findMany({
    where: { role: "SALES", isActive: true },
    orderBy: { name: "asc" },
    take: 50,
    select: {
      id: true,
      name: true,
      assignedAreaSlugs: true,
      salesLeads: {
        where: {
          leadType: "SERVICE",
          serviceStage: { notIn: ["COMPLETED", "LOST"] },
        },
        select: { id: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name || "Sales",
    assignedAreaSlugs: u.assignedAreaSlugs,
    openCount: u.salesLeads.length,
  }));
}

export async function assignServiceLeadAction(
  leadId: string,
  salesPersonId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "Forbidden" };

  const sp = await prisma.user.findFirst({
    where: { id: salesPersonId, role: "SALES", isActive: true },
    select: { id: true, name: true },
  });
  if (!sp) return { ok: false, error: "Salesperson not found." };

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, leadType: "SERVICE" },
    select: { id: true },
  });
  if (!lead) return { ok: false, error: "Lead not found." };

  await prisma.lead.update({
    where: { id: leadId },
    data: { salesPersonId },
  });

  await logLeadActivity({
    leadId,
    actorId: admin.userId,
    kind: "ASSIGNED",
    message: `Assigned to ${sp.name}`,
    meta: { salesPersonId },
  });

  revalidateServicesLeads();
  return { ok: true };
}

export async function updateServiceLeadStageAction(
  leadId: string,
  stage: ServiceLeadStage,
  lostReason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = updateServiceLeadStageSchema.safeParse({
    leadId,
    stage,
    lostReason,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid stage update." };
  }

  if (parsed.data.stage === "LOST" && !parsed.data.lostReason?.trim()) {
    return { ok: false, error: "Lost reason is required." };
  }

  const updated = await prisma.lead.updateMany({
    where: { id: parsed.data.leadId, leadType: "SERVICE" },
    data: {
      serviceStage: parsed.data.stage,
      ...(parsed.data.stage === "LOST"
        ? { lostReason: parsed.data.lostReason?.trim() }
        : {}),
    },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Lead not found." };
  }

  await logLeadActivity({
    leadId: parsed.data.leadId,
    actorId: admin.userId,
    kind: "STAGE",
    message: `Stage → ${parsed.data.stage}`,
    meta: { stage: parsed.data.stage, lostReason: parsed.data.lostReason },
  });

  revalidateServicesLeads();
  return { ok: true };
}

export async function markQuotationSentAdminAction(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await sessionCanSendQuotes())) {
    return { ok: false, error: "You cannot mark quotations sent." };
  }

  const parsed = markQuotationSentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the quotation fields." };
  }

  const admin = await requireAdminSession();
  const sales = await requireSalesSession();
  const actorId = admin?.userId ?? sales?.userId;
  if (!actorId) return { ok: false, error: "Forbidden" };

  const lead = await prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      leadType: "SERVICE",
      ...(sales ? { salesPersonId: sales.userId } : {}),
    },
    select: { id: true },
  });
  if (!lead) return { ok: false, error: "Lead not found." };

  await prisma.lead.update({
    where: { id: parsed.data.leadId },
    data: {
      serviceStage: "QUOTATION_SENT",
      quoteAmountPaise: parsed.data.amountPaise,
      quoteSentAt: parsed.data.sentAt,
      billbookRef: parsed.data.billbookRef,
      quoteHandoffRequested: false,
    },
  });

  await logLeadActivity({
    leadId: parsed.data.leadId,
    actorId,
    kind: "QUOTATION_SENT",
    message: `Quotation sent · BB ${parsed.data.billbookRef}`,
    meta: {
      amountPaise: parsed.data.amountPaise,
      billbookRef: parsed.data.billbookRef,
    },
  });

  revalidateServicesLeads();
  revalidatePath(`/sales/leads/${parsed.data.leadId}`);
  return { ok: true };
}

export async function requestQuoteAdminHandoffAction(
  leadId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { ok: false, error: "Forbidden" };
  if (sales.canSendQuotes) {
    return { ok: false, error: "You can mark the quotation yourself." };
  }

  const updated = await prisma.lead.updateMany({
    where: { id: leadId, leadType: "SERVICE", salesPersonId: sales.userId },
    data: { quoteHandoffRequested: true },
  });
  if (updated.count === 0) return { ok: false, error: "Lead not found." };

  await logLeadActivity({
    leadId,
    actorId: sales.userId,
    kind: "QUOTE_HANDOFF",
    message: "Requested admin to send quotation",
  });

  revalidateServicesLeads();
  revalidatePath(`/sales/leads/${leadId}`);
  return { ok: true };
}
