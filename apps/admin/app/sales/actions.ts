"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import type { LeadStatus, LeadType } from "@prisma/client";
import type { ServiceLeadStage } from "@prisma/client";
import { SERVICE_LEAD_STAGES } from "@repo/lib";
import { logLeadActivity } from "../../lib/lead-activity";
import { createSalesBookingNotification } from "../../lib/sales-notifications";
import {
  requireAdminSession,
  requireSalesSession,
  sessionCanSendQuotes,
} from "../../lib/sales-auth";

const SALES_PATHS = ["/sales", "/sales/leads"];

function revalidateSales() {
  for (const p of SALES_PATHS) revalidatePath(p);
  revalidatePath("/sales-overview");
}

export type LeadRow = {
  id: string;
  name: string;
  phoneNumber: string;
  leadType: LeadType;
  source: string;
  status: LeadStatus;
  serviceStage: ServiceLeadStage | null;
  serviceSlug: string | null;
  areaLabel: string | null;
  landSize: string | null;
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadActivityRow = {
  id: string;
  kind: string;
  message: string;
  createdAt: Date;
};

export type LeadNoteRow = {
  id: string;
  text: string;
  createdAt: Date;
  authorName: string;
};

export type LeadDetail = LeadRow & {
  notes: LeadNoteRow[];
  activities: LeadActivityRow[];
  timeline: string | null;
  landType: string | null;
  whatsappOptIn: boolean;
  quoteAmountPaise: number | null;
  billbookRef: string | null;
  quoteHandoffRequested: boolean;
  canSendQuotes: boolean;
};

export type SalesStats = {
  totalLeads: number;
  byStatus: Record<LeadStatus, number>;
  totalConverted: number;
  convertedThisWeek: number;
  convertedThisMonth: number;
};

export type BookingLookupRow = {
  id: string;
  label: string;
  customerName: string;
  customerPhone: string | null;
  equipmentName: string;
  createdAt: Date;
};

export type NotificationRow = {
  id: string;
  message: string;
  read: boolean;
  bookingId: string | null;
  leadId: string | null;
  createdAt: Date;
};

export async function fetchSalesStats(): Promise<SalesStats | null> {
  const sales = await requireSalesSession();
  if (!sales) return null;

  const leads = await prisma.lead.findMany({
    where: { salesPersonId: sales.userId },
    select: { status: true, updatedAt: true },
  });

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const byStatus: Record<LeadStatus, number> = {
    NEW: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    CONVERTED: 0,
    DEAD: 0,
  };

  let convertedThisWeek = 0;
  let convertedThisMonth = 0;

  for (const lead of leads) {
    byStatus[lead.status] += 1;
    if (lead.status === "CONVERTED") {
      if (lead.updatedAt >= weekAgo) convertedThisWeek += 1;
      if (lead.updatedAt >= monthStart) convertedThisMonth += 1;
    }
  }

  return {
    totalLeads: leads.length,
    byStatus,
    totalConverted: byStatus.CONVERTED,
    convertedThisWeek,
    convertedThisMonth,
  };
}

export async function fetchMyLeads(params: {
  status?: LeadStatus;
  leadType?: LeadType;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: LeadRow[]; total: number } | null> {
  const sales = await requireSalesSession();
  if (!sales) return null;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
  const search = params.search?.trim();

  const where = {
    salesPersonId: sales.userId,
    ...(params.status ? { status: params.status } : {}),
    ...(params.leadType ? { leadType: params.leadType } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phoneNumber: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        leadType: true,
        source: true,
        status: true,
        serviceStage: true,
        serviceSlug: true,
        areaLabel: true,
        landSize: true,
        bookingId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total };
}

export async function fetchLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const sales = await requireSalesSession();
  const admin = await requireAdminSession();
  if (!sales && !admin) return null;

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      ...(sales ? { salesPersonId: sales.userId } : {}),
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      leadType: true,
      source: true,
      status: true,
      serviceStage: true,
      serviceSlug: true,
      areaLabel: true,
      landSize: true,
      timeline: true,
      landType: true,
      whatsappOptIn: true,
      quoteAmountPaise: true,
      billbookRef: true,
      quoteHandoffRequested: true,
      bookingId: true,
      createdAt: true,
      updatedAt: true,
      notes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          kind: true,
          message: true,
          createdAt: true,
        },
      },
    },
  });

  if (!lead) return null;

  return {
    ...lead,
    notes: lead.notes.map((n) => ({
      id: n.id,
      text: n.text,
      createdAt: n.createdAt,
      authorName: n.author.name || "Sales",
    })),
    activities: lead.activities,
    canSendQuotes: admin?.canSendQuotes ?? sales?.canSendQuotes ?? false,
  };
}

export async function createLeadAction(input: {
  name: string;
  phoneNumber: string;
  leadType: LeadType;
  source: string;
  serviceSlug?: string;
  areaLabel?: string;
  landSize?: string;
  timeline?: string;
  landType?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false, error: "Forbidden" };

  const name = input.name.trim();
  const phoneNumber = input.phoneNumber.replace(/\D/g, "").slice(-10);
  if (!name) return { success: false, error: "Name is required." };
  if (phoneNumber.length !== 10) {
    return { success: false, error: "Enter a valid 10-digit phone number." };
  }

  const isService = input.leadType === "SERVICE";

  const lead = await prisma.lead.create({
    data: {
      salesPersonId: sales.userId,
      name,
      phoneNumber,
      leadType: input.leadType,
      source: input.source.trim() || (isService ? "Field visit" : ""),
      status: "NEW",
      ...(isService
        ? {
            serviceStage: "NEW" as ServiceLeadStage,
            serviceSlug: input.serviceSlug?.trim() || null,
            areaLabel: input.areaLabel?.trim() || null,
            landSize: input.landSize?.trim() || null,
            timeline: input.timeline?.trim() || null,
            landType: input.landType?.trim() || null,
          }
        : {}),
    },
    select: { id: true },
  });

  if (isService) {
    await logLeadActivity({
      leadId: lead.id,
      actorId: sales.userId,
      kind: "CREATED",
      message: "Service lead created in the field",
    });
  }

  revalidateSales();
  revalidatePath("/services-leads");
  return { success: true, id: lead.id };
}

export async function updateServiceLeadStageSalesAction(
  leadId: string,
  stage: ServiceLeadStage,
  lostReason?: string,
): Promise<{ success: boolean; error?: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false, error: "Forbidden" };

  if (stage === "LOST" && !lostReason?.trim()) {
    return { success: false, error: "Add a lost reason." };
  }
  if (!(SERVICE_LEAD_STAGES as readonly string[]).includes(stage)) {
    return { success: false, error: "Invalid stage." };
  }

  const updated = await prisma.lead.updateMany({
    where: { id: leadId, leadType: "SERVICE", salesPersonId: sales.userId },
    data: {
      serviceStage: stage,
      ...(stage === "LOST" ? { lostReason: lostReason?.trim() } : {}),
    },
  });
  if (updated.count === 0) return { success: false, error: "Lead not found." };

  await logLeadActivity({
    leadId,
    actorId: sales.userId,
    kind: "STAGE",
    message: `Stage → ${stage}`,
    meta: { stage },
  });

  revalidateSales();
  revalidatePath(`/sales/leads/${leadId}`);
  revalidatePath("/services-leads");
  return { success: true };
}

export async function markQuotationSentSalesAction(input: {
  leadId: string;
  amountPaise: number;
  sentAt: Date;
  billbookRef: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await sessionCanSendQuotes())) {
    return { success: false, error: "You cannot mark quotations sent." };
  }

  const admin = await requireAdminSession();
  const sales = await requireSalesSession();
  const actorId = admin?.userId ?? sales?.userId;
  if (!actorId) return { success: false, error: "Forbidden" };

  const ref = input.billbookRef.trim();
  if (!ref) return { success: false, error: "Billbook reference is required." };
  if (input.amountPaise <= 0) {
    return { success: false, error: "Enter a valid quoted amount." };
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: input.leadId,
      leadType: "SERVICE",
      ...(sales ? { salesPersonId: sales.userId } : {}),
    },
    select: { id: true },
  });
  if (!lead) return { success: false, error: "Lead not found." };

  await prisma.lead.update({
    where: { id: input.leadId },
    data: {
      serviceStage: "QUOTATION_SENT",
      quoteAmountPaise: input.amountPaise,
      quoteSentAt: input.sentAt,
      billbookRef: ref,
      quoteHandoffRequested: false,
    },
  });

  await logLeadActivity({
    leadId: input.leadId,
    actorId,
    kind: "QUOTATION_SENT",
    message: `Quotation sent · BB ${ref}`,
    meta: { amountPaise: input.amountPaise, billbookRef: ref },
  });

  revalidateSales();
  revalidatePath("/services-leads");
  revalidatePath(`/sales/leads/${input.leadId}`);
  return { success: true };
}

export async function requestQuoteAdminHandoffSalesAction(
  leadId: string,
): Promise<{ success: boolean; error?: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false, error: "Forbidden" };
  if (sales.canSendQuotes) {
    return { success: false, error: "You can mark the quotation yourself." };
  }

  const updated = await prisma.lead.updateMany({
    where: { id: leadId, leadType: "SERVICE", salesPersonId: sales.userId },
    data: { quoteHandoffRequested: true },
  });
  if (updated.count === 0) return { success: false, error: "Lead not found." };

  await logLeadActivity({
    leadId,
    actorId: sales.userId,
    kind: "QUOTE_HANDOFF",
    message: "Requested admin to send quotation",
  });

  revalidateSales();
  revalidatePath("/services-leads");
  revalidatePath(`/sales/leads/${leadId}`);
  return { success: true };
}

export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
): Promise<{ success: boolean; error?: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false, error: "Forbidden" };

  const result = await prisma.lead.updateMany({
    where: { id: leadId, salesPersonId: sales.userId },
    data: { status },
  });
  if (result.count === 0) return { success: false, error: "Lead not found." };

  revalidateSales();
  revalidatePath(`/sales/leads/${leadId}`);
  return { success: true };
}

export async function appendLeadNoteAction(
  leadId: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const sales = await requireSalesSession();
  const admin = await requireAdminSession();
  const authorId = sales?.userId ?? admin?.userId;
  if (!authorId) return { success: false, error: "Forbidden" };

  const trimmed = text.trim();
  if (!trimmed) return { success: false, error: "Note cannot be empty." };

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      ...(sales ? { salesPersonId: sales.userId } : {}),
    },
    select: { id: true },
  });
  if (!lead) return { success: false, error: "Lead not found." };

  await prisma.leadNote.create({
    data: {
      leadId,
      authorId,
      text: trimmed,
    },
  });

  revalidatePath(`/sales/leads/${leadId}`);
  return { success: true };
}

export async function convertLeadAction(
  leadId: string,
  bookingId?: string,
): Promise<{ success: boolean; error?: string }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false, error: "Forbidden" };

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, salesPersonId: sales.userId },
    select: { id: true, name: true, status: true },
  });
  if (!lead) return { success: false, error: "Lead not found." };

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        ...(bookingId ? { bookingId } : {}),
      },
    });

    if (bookingId) {
      await tx.booking.update({
        where: { id: bookingId },
        data: { salesPersonId: sales.userId },
      });
    }
  });

  if (bookingId) {
    await createSalesBookingNotification({
      recipientId: sales.userId,
      leadName: lead.name,
      bookingId,
      leadId,
    });
  }

  revalidateSales();
  revalidatePath(`/sales/leads/${leadId}`);
  revalidatePath("/bookings");
  return { success: true };
}

export async function searchBookingsForLink(
  query: string,
): Promise<BookingLookupRow[]> {
  const sales = await requireSalesSession();
  if (!sales) return [];

  const q = query.trim();
  if (q.length < 2) return [];

  const digits = q.replace(/\D/g, "");
  const bookings = await prisma.booking.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    where: {
      OR: [
        ...(digits.length >= 4
          ? [{ user: { phoneNumber: { contains: digits.slice(-10) } } }]
          : []),
        { user: { name: { contains: q, mode: "insensitive" as const } } },
        { equipment: { name: { contains: q, mode: "insensitive" as const } } },
        {
          equipment: {
            partner: {
              companyName: { contains: q, mode: "insensitive" as const },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true, phoneNumber: true } },
      equipment: {
        select: {
          name: true,
          partner: { select: { companyName: true } },
        },
      },
    },
  });

  return bookings.map((b) => {
    const partner = b.equipment.partner?.companyName;
    const label = [
      b.user.name || "Customer",
      b.equipment.name,
      partner ? `(${partner})` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      id: b.id,
      label,
      customerName: b.user.name ?? "Guest",
      customerPhone: b.user.phoneNumber,
      equipmentName: b.equipment.name,
      createdAt: b.createdAt,
    };
  });
}

export async function fetchNotifications(): Promise<{
  items: NotificationRow[];
  unreadCount: number;
} | null> {
  const sales = await requireSalesSession();
  if (!sales) return null;

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: sales.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        message: true,
        read: true,
        bookingId: true,
        leadId: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { recipientId: sales.userId, read: false },
    }),
  ]);

  return { items, unreadCount };
}

export async function markNotificationReadAction(
  id: string,
): Promise<{ success: boolean }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false };

  await prisma.notification.updateMany({
    where: { id, recipientId: sales.userId },
    data: { read: true },
  });
  revalidatePath("/sales");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  const sales = await requireSalesSession();
  if (!sales) return { success: false };

  await prisma.notification.updateMany({
    where: { recipientId: sales.userId, read: false },
    data: { read: true },
  });
  revalidatePath("/sales");
  return { success: true };
}

// ─── Super Admin: Sales Overview ───────────────────────────────────────────

export type SalesPersonSummary = {
  id: string;
  name: string;
  phoneNumber: string | null;
  totalLeads: number;
  byStatus: Record<LeadStatus, number>;
  totalConverted: number;
};

export async function fetchSalesOverview(): Promise<SalesPersonSummary[] | null> {
  if (!(await requireAdminSession())) return null;

  const salesPeople = await prisma.user.findMany({
    where: { role: "SALES" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      salesLeads: { select: { status: true } },
    },
  });

  return salesPeople.map((sp) => {
    const byStatus: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      CONVERTED: 0,
      DEAD: 0,
    };
    for (const lead of sp.salesLeads) {
      byStatus[lead.status] += 1;
    }
    return {
      id: sp.id,
      name: sp.name || sp.phoneNumber || "Sales",
      phoneNumber: sp.phoneNumber,
      totalLeads: sp.salesLeads.length,
      byStatus,
      totalConverted: byStatus.CONVERTED,
    };
  });
}

export async function fetchSalesPersonLeadsAdmin(
  salesPersonId: string,
): Promise<(LeadRow & { notes: LeadNoteRow[] })[] | null> {
  if (!(await requireAdminSession())) return null;

  const leads = await prisma.lead.findMany({
    where: { salesPersonId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      leadType: true,
      source: true,
      status: true,
      serviceStage: true,
      serviceSlug: true,
      areaLabel: true,
      landSize: true,
      bookingId: true,
      createdAt: true,
      updatedAt: true,
      notes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  return leads.map((l) => ({
    ...l,
    notes: l.notes.map((n) => ({
      id: n.id,
      text: n.text,
      createdAt: n.createdAt,
      authorName: n.author.name || "Sales",
    })),
  }));
}

export async function fetchSalesPersonAdmin(
  salesPersonId: string,
): Promise<{ id: string; name: string; phoneNumber: string | null } | null> {
  if (!(await requireAdminSession())) return null;

  return prisma.user.findFirst({
    where: { id: salesPersonId, role: "SALES" },
    select: { id: true, name: true, phoneNumber: true },
  });
}
