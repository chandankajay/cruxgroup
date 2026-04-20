import "server-only";

import { prisma } from "@repo/db";
import { sendInvoiceOverdueReminderWhatsApp } from "@repo/lib/aisensy";

const MS_DAY = 86400000;

/**
 * Sends at most one overdue WhatsApp per invoice per run: D+3, then D+7, then D+15
 * (only while invoice remains UNPAID or PARTIALLY_PAID and a payment link exists).
 */
export async function dispatchInvoicePaymentReminders(): Promise<{
  sentD3: number;
  sentD7: number;
  sentD15: number;
}> {
  const invoices = await prisma.invoice.findMany({
    where: {
      paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },
    },
    include: {
      trip: { include: { user: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const now = Date.now();
  let sentD3 = 0;
  let sentD7 = 0;
  let sentD15 = 0;

  for (const inv of invoices) {
    const phone = inv.trip.user.phoneNumber;
    const payUrl = inv.payments[0]?.paymentLinkUrl;
    if (!phone?.trim() || !payUrl) continue;

    const days = (now - inv.createdAt.getTime()) / MS_DAY;
    const amountInr = (inv.amount / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (days >= 15 && !inv.reminderD15SentAt) {
      await sendInvoiceOverdueReminderWhatsApp({
        customerPhone: phone,
        invoiceNumber: inv.invoiceNumber,
        stage: "D+15",
        amountInrLabel: amountInr,
        paymentUrl: payUrl,
      });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { reminderD15SentAt: new Date() },
      });
      sentD15++;
      continue;
    }
    if (days >= 7 && !inv.reminderD7SentAt) {
      await sendInvoiceOverdueReminderWhatsApp({
        customerPhone: phone,
        invoiceNumber: inv.invoiceNumber,
        stage: "D+7",
        amountInrLabel: amountInr,
        paymentUrl: payUrl,
      });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { reminderD7SentAt: new Date() },
      });
      sentD7++;
      continue;
    }
    if (days >= 3 && !inv.reminderD3SentAt) {
      await sendInvoiceOverdueReminderWhatsApp({
        customerPhone: phone,
        invoiceNumber: inv.invoiceNumber,
        stage: "D+3",
        amountInrLabel: amountInr,
        paymentUrl: payUrl,
      });
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { reminderD3SentAt: new Date() },
      });
      sentD3++;
    }
  }

  return { sentD3, sentD7, sentD15 };
}
