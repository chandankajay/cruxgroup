import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";

/**
 * Partner routes require a profile and accepted terms (onboarding complete).
 */
export async function redirectPartnerIncompleteOnboarding(): Promise<void> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const userId = session?.user?.id;

  if (role !== "PARTNER" || !userId) return;

  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true, termsAcceptedAt: true },
  });

  if (!partner || !partner.termsAcceptedAt) {
    redirect("/onboarding");
  }
}
