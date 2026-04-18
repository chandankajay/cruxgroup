import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";

/**
 * If the signed-in user is a PARTNER without a `Partner` row, redirect to onboarding.
 * Call from route layouts that must not run until onboarding is complete.
 */
export async function redirectPartnerWithoutProfile(): Promise<void> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const userId = session?.user?.id;

  if (role !== "PARTNER" || !userId) return;

  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!partner) {
    redirect("/onboarding");
  }
}
