import { prisma } from "@repo/db";

/**
 * Ensures a `Customer` row exists for this platform user so B2C saved sites can attach.
 * Does not merge by phone — avoids overwriting partner-created CRM customers.
 */
export async function getOrCreateB2cCustomer(userId: string) {
  const linked = await prisma.customer.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (linked) return linked;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneNumber: true, name: true },
  });
  const phone = user?.phoneNumber?.trim();
  if (!user || !phone) return null;

  return prisma.customer.create({
    data: {
      userId,
      name: user.name?.trim() || "Customer",
      phone,
    },
    select: { id: true },
  });
}
