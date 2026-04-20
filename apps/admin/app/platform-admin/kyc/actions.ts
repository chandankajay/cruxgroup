"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { auth } from "../../../lib/auth";

async function assertAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "ADMIN") {
    return { ok: false, error: "Forbidden" };
  }
  return { ok: true };
}

export async function verifyPartnerKyc(partnerId: string): Promise<{ success: boolean; error?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const updated = await prisma.partner.updateMany({
      where: { id: partnerId, kycStatus: "SUBMITTED" },
      data: {
        kycStatus: "VERIFIED",
        kycRejectionReason: null,
      },
    });
    if (updated.count === 0) {
      return { success: false, error: "Partner is no longer in the submitted queue." };
    }
    revalidatePath("/platform-admin/kyc");
    return { success: true };
  } catch {
    return { success: false, error: "Could not verify partner." };
  }
}

export async function rejectPartnerKyc(
  partnerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return { success: false, error: "Please enter a rejection reason (at least 3 characters)." };
  }

  try {
    const updated = await prisma.partner.updateMany({
      where: { id: partnerId, kycStatus: "SUBMITTED" },
      data: {
        kycStatus: "REJECTED",
        kycRejectionReason: trimmed,
      },
    });
    if (updated.count === 0) {
      return { success: false, error: "Partner is no longer in the submitted queue." };
    }
    revalidatePath("/platform-admin/kyc");
    return { success: true };
  } catch {
    return { success: false, error: "Could not reject application." };
  }
}
