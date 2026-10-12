"use server";

import { revalidatePath } from "next/cache";
import { assertSalesRoleSelectable } from "@repo/lib";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";
import { homePathForRole } from "../../lib/role-routes";

export type SelectAdminRoleResult =
  | { ok: true; role: "PARTNER"; redirectTo: string }
  | { ok: true; redirectTo: string; alreadyChosen: true }
  | { ok: false; error: string };

export async function selectAdminRoleAction(
  role: "PARTNER" | "SALES",
): Promise<SelectAdminRoleResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const currentRole = session?.user?.role;

  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  if (currentRole !== "USER") {
    return {
      ok: true,
      alreadyChosen: true,
      redirectTo: homePathForRole(currentRole ?? "ADMIN"),
    };
  }

  let partnerRole: "PARTNER";
  try {
    partnerRole = assertSalesRoleSelectable(role);
  } catch {
    return {
      ok: false,
      error: "Sales accounts are created by an admin. Choose Fleet Owner to continue.",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: partnerRole,
      adminRoleChosenAt: new Date(),
    },
  });

  revalidatePath("/");
  return { ok: true, role: partnerRole, redirectTo: homePathForRole(partnerRole) };
}
