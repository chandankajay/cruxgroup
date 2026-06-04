"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { PARTNER_TERMS_VERSION } from "@repo/lib/legal/partner-terms";
import { auth } from "../auth";

export type AcceptPartnerTermsResult = { success: false; error: string };

/** Server action: `partner.acceptTerms` — records Partner T&C acceptance. */
export async function acceptTerms(): Promise<AcceptPartnerTermsResult | void> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }
  if (role !== "PARTNER") {
    return { success: false, error: "Only partner accounts can accept these terms." };
  }

  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true, termsAcceptedAt: true },
  });

  if (!partner) {
    return {
      success: false,
      error: "Partner profile not found. Complete fleet setup before accepting terms.",
    };
  }

  if (partner.termsAcceptedAt) {
    redirect("/dashboard");
  }

  await prisma.partner.update({
    where: { id: partner.id },
    data: {
      termsAcceptedAt: new Date(),
      termsVersion: PARTNER_TERMS_VERSION,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect("/dashboard");
}
