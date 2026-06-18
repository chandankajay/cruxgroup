import { prisma } from "@repo/db";

export async function createSalesBookingNotification(params: {
  recipientId: string;
  leadName: string;
  bookingId: string;
  leadId?: string;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      message: `Your lead ${params.leadName} was linked to a booking.`,
      bookingId: params.bookingId,
      leadId: params.leadId,
    },
  });
}
