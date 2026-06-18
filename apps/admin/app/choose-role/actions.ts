"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";
import { homePathForRole } from "../../lib/role-routes";

export type SelectAdminRoleResult =
  | { ok: true; role: "PARTNER" | "SALES"; redirectTo: string }
  | { ok: true; redirectTo: string; alreadyChosen: true }
  | { ok: false; error: string };

export async function selectAdminRoleAction(
  role: "PARTNER" | "SALES",
): Promise<SelectAdminRoleResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const currentRole = (session?.user as { role?: string } | undefined)?.role;

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

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      adminRoleChosenAt: new Date(),
    },
  });

  revalidatePath("/");
  return { ok: true, role, redirectTo: homePathForRole(role) };
}
