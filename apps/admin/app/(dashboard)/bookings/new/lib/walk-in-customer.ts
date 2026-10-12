import "server-only";

import { prisma } from "@repo/db";
import { normalizeAdminPhone } from "../../../../../lib/phone";

type WalkInCustomerInput = {
  name: string;
  phone: string;
  company?: string;
  gstin?: string;
};

/** CRM customer quick-add for walk-in desks (server-only helper, not a client action). */
export async function upsertWalkInCustomer(input: WalkInCustomerInput): Promise<{
  id: string;
  name: string;
  phone: string;
}> {
  const phone = normalizeAdminPhone(input.phone);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Invalid phone number");
  }

  const platformUser = await prisma.user.upsert({
    where: { phoneNumber: phone },
    create: {
      phoneNumber: phone,
      name: input.name.trim(),
      role: "USER",
    },
    update: { name: input.name.trim() },
    select: { id: true },
  });

  const payload = {
    name: input.name.trim(),
    phone,
    company: input.company?.trim() ?? "",
    gstin: input.gstin?.trim() || null,
  };

  const byUser = await prisma.customer.findFirst({
    where: { userId: platformUser.id },
    select: { id: true },
  });
  if (byUser) {
    return prisma.customer.update({
      where: { id: byUser.id },
      data: payload,
      select: { id: true, name: true, phone: true },
    });
  }

  const byPhone = await prisma.customer.findFirst({
    where: { phone },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (byPhone) {
    return prisma.customer.update({
      where: { id: byPhone.id },
      data: { ...payload, userId: platformUser.id },
      select: { id: true, name: true, phone: true },
    });
  }

  return prisma.customer.create({
    data: { ...payload, userId: platformUser.id },
    select: { id: true, name: true, phone: true },
  });
}
