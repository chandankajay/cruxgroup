"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdminSession } from "../../../lib/sales-auth";
import {
  upsertSalespersonSchema,
  type UpsertSalespersonInput,
} from "@repo/validators/salesperson";
import { normalizeAdminPhone, ADMIN_PHONE_E164 } from "../../../lib/phone";

export type { UpsertSalespersonInput } from "@repo/validators/salesperson";

const SALESPEOPLE_PATH = "/salespeople";

function revalidateSalespeople() {
  revalidatePath(SALESPEOPLE_PATH);
  revalidatePath("/sales-overview");
}

export type SalespersonRow = {
  id: string;
  name: string;
  phoneNumber: string;
  canSendQuotes: boolean;
  isActive: boolean;
  assignedAreaSlugs: string[];
  openLeads: number;
  lastLoginAt: Date | null;
};

export type SalespersonDetail = SalespersonRow;

export async function fetchSalespeople(): Promise<SalespersonRow[] | null> {
  const admin = await requireAdminSession();
  if (!admin) return null;

  const users = await prisma.user.findMany({
    where: { role: "SALES" },
    orderBy: { name: "asc" },
    take: 100,
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      canSendQuotes: true,
      isActive: true,
      assignedAreaSlugs: true,
      salesLeads: {
        where: {
          OR: [
            {
              leadType: { not: "SERVICE" },
              status: { in: ["NEW", "CONTACTED", "INTERESTED"] },
            },
            {
              leadType: "SERVICE",
              serviceStage: {
                notIn: ["COMPLETED", "LOST"],
              },
            },
          ],
        },
        select: { id: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name || "Sales",
    phoneNumber: u.phoneNumber ?? "",
    canSendQuotes: u.canSendQuotes,
    isActive: u.isActive,
    assignedAreaSlugs: u.assignedAreaSlugs,
    openLeads: u.salesLeads.length,
    lastLoginAt: null,
  }));
}

export async function fetchSalespersonById(
  id: string,
): Promise<SalespersonDetail | null> {
  const admin = await requireAdminSession();
  if (!admin) return null;

  const u = await prisma.user.findFirst({
    where: { id, role: "SALES" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      canSendQuotes: true,
      isActive: true,
      assignedAreaSlugs: true,
      salesLeads: {
        where: {
          OR: [
            {
              leadType: { not: "SERVICE" },
              status: { in: ["NEW", "CONTACTED", "INTERESTED"] },
            },
            {
              leadType: "SERVICE",
              serviceStage: {
                notIn: ["COMPLETED", "LOST"],
              },
            },
          ],
        },
        select: { id: true },
      },
    },
  });
  if (!u) return null;

  return {
    id: u.id,
    name: u.name || "Sales",
    phoneNumber: u.phoneNumber ?? "",
    canSendQuotes: u.canSendQuotes,
    isActive: u.isActive,
    assignedAreaSlugs: u.assignedAreaSlugs,
    openLeads: u.salesLeads.length,
    lastLoginAt: null,
  };
}

function parseUpsertInput(raw: unknown): UpsertSalespersonInput | { error: string } {
  const parsed = upsertSalespersonSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const phone = normalizeAdminPhone(parsed.data.phoneNumber);
  if (!ADMIN_PHONE_E164.test(phone)) {
    return { error: "Enter a valid Indian mobile number." };
  }
  const slugs = parsed.data.assignedAreaSlugs.map((s) => s.toLowerCase());
  return {
    ...parsed.data,
    phoneNumber: phone,
    assignedAreaSlugs: slugs,
  };
}

export async function createSalespersonAction(
  raw: UpsertSalespersonInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = parseUpsertInput(raw);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const existing = await prisma.user.findUnique({
    where: { phoneNumber: parsed.phoneNumber },
    select: { id: true, role: true },
  });
  if (existing && existing.role !== "SALES") {
    return {
      ok: false,
      error: "This phone is already used by a partner or admin account.",
    };
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "SALES",
          name: parsed.name,
          canSendQuotes: parsed.canSendQuotes,
          isActive: parsed.isActive,
          assignedAreaSlugs: parsed.assignedAreaSlugs,
          adminRoleChosenAt: new Date(),
        },
        select: { id: true },
      })
    : await prisma.user.create({
        data: {
          phoneNumber: parsed.phoneNumber,
          name: parsed.name,
          role: "SALES",
          canSendQuotes: parsed.canSendQuotes,
          isActive: parsed.isActive,
          assignedAreaSlugs: parsed.assignedAreaSlugs,
          adminRoleChosenAt: new Date(),
        },
        select: { id: true },
      });

  revalidateSalespeople();
  return { ok: true, id: user.id };
}

export async function updateSalespersonAction(
  id: string,
  raw: UpsertSalespersonInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = parseUpsertInput(raw);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const target = await prisma.user.findFirst({
    where: { id, role: "SALES" },
    select: { id: true, phoneNumber: true },
  });
  if (!target) return { ok: false, error: "Salesperson not found." };

  if (parsed.phoneNumber !== target.phoneNumber) {
    const clash = await prisma.user.findUnique({
      where: { phoneNumber: parsed.phoneNumber },
      select: { id: true },
    });
    if (clash && clash.id !== id) {
      return { ok: false, error: "Another account already uses this phone." };
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.name,
      phoneNumber: parsed.phoneNumber,
      canSendQuotes: parsed.canSendQuotes,
      isActive: parsed.isActive,
      assignedAreaSlugs: parsed.assignedAreaSlugs,
    },
  });

  revalidateSalespeople();
  revalidatePath(`${SALESPEOPLE_PATH}/${id}/edit`);
  return { ok: true };
}
