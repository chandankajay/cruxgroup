"use server";

import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";

export type ProfileFormState =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfileAction(input: {
  name: string;
  email: string;
  companyName: string;
}): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }

  const name = input.name.trim();
  const emailTrim = input.email.trim();
  const companyTrim = input.companyName.trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: emailTrim === "" ? null : emailTrim,
      companyName: companyTrim,
    },
  });

  return { ok: true };
}
