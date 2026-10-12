"use server";

import { revalidatePath } from "next/cache";
import { assertSalesRoleSelectable } from "@repo/lib/sales-permissions";
import { selectAdminRoleServerSchema } from "@repo/validators/admin-role";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";
import { homePathForRole } from "../../lib/role-routes";

export type SelectAdminRoleResult =
  | { ok: true; role: "PARTNER"; redirectTo: string }
  | { ok: true; redirectTo: string; alreadyChosen: true }
  | { ok: false; error: string };

export async function selectAdminRoleAction(
  role: unknown,
): Promise<SelectAdminRoleResult> {
  const roleParsed = selectAdminRoleServerSchema.safeParse(role);
  if (!roleParsed.success) {
    return { ok: false, error: "Invalid role selection." };
  }
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
    partnerRole = assertSalesRoleSelectable(roleParsed.data);
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
