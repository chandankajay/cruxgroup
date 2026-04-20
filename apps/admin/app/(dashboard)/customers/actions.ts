"use server";

import type { Invoice, Payment } from "@prisma/client";
import { prisma } from "@repo/db";
import { auth } from "../../../lib/auth";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" && !!session?.user?.id;
}

export function outstandingPaiseForInvoice(
  invoice: Pick<Invoice, "amount"> & {
    payments: Pick<Payment, "amountPaid" | "status">[];
  }
): number {
  const paid = invoice.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amountPaid, 0);
  return Math.max(0, invoice.amount - paid);
}

export type CrmCustomerRow = {
  id: string;
  name: string;
  company: string;
  phone: string;
  creditLimit: number;
  outstandingPaise: number;
};

export async function fetchCrmCustomers(): Promise<CrmCustomerRow[] | null> {
  if (!(await requireAdmin())) return null;

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      creditLimit: true,
    },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },
      trip: { bookingId: { not: null } },
    },
    include: {
      payments: { select: { amountPaid: true, status: true } },
      trip: {
        select: {
          booking: { select: { customerId: true } },
        },
      },
    },
  });

  const byCustomer = new Map<string, number>();
  for (const inv of invoices) {
    const cid = inv.trip.booking?.customerId;
    if (!cid) continue;
    const due = outstandingPaiseForInvoice(inv);
    byCustomer.set(cid, (byCustomer.get(cid) ?? 0) + due);
  }

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    phone: c.phone,
    creditLimit: c.creditLimit,
    outstandingPaise: byCustomer.get(c.id) ?? 0,
  }));
}

export type CustomerBookingTimelineItem = {
  id: string;
  status: string;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  expectedShift: string | null;
  pricing: { total: number; duration: number; unit: string };
  equipment: { id: string; name: string; category: string };
  siteAddress: string | null;
  location: {
    address: string;
    pincode: string;
    coordinates: { lat: number; lng: number };
  };
};

export type CustomerDetailData = {
  id: string;
  name: string;
  company: string;
  phone: string;
  gstin: string | null;
  creditLimit: number;
  outstandingPaise: number;
  bookings: CustomerBookingTimelineItem[];
};

export async function fetchCustomerDetail(
  customerId: string
): Promise<"unauthorized" | "not_found" | CustomerDetailData> {
  if (!(await requireAdmin())) return "unauthorized";

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) return "not_found";

  const invoices = await prisma.invoice.findMany({
    where: {
      paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },
      trip: {
        booking: {
          is: { customerId },
        },
      },
    },
    include: {
      payments: { select: { amountPaid: true, status: true } },
    },
  });

  const outstandingPaise = invoices.reduce(
    (s, inv) => s + outstandingPaiseForInvoice(inv),
    0
  );

  const bookings = await prisma.booking.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      equipment: { select: { id: true, name: true, category: true } },
    },
  });

  const timeline: CustomerBookingTimelineItem[] = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    createdAt: b.createdAt,
    startDate: b.startDate,
    endDate: b.endDate,
    expectedShift: b.expectedShift,
    pricing: {
      total: b.pricing.total,
      duration: b.pricing.duration,
      unit: b.pricing.unit,
    },
    equipment: b.equipment,
    siteAddress: b.siteAddress,
    location: {
      address: b.location.address,
      pincode: b.location.pincode,
      coordinates: {
        lat: b.location.coordinates.lat,
        lng: b.location.coordinates.lng,
      },
    },
  }));

  return {
    id: customer.id,
    name: customer.name,
    company: customer.company,
    phone: customer.phone,
    gstin: customer.gstin,
    creditLimit: customer.creditLimit,
    outstandingPaise,
    bookings: timeline,
  };
}
