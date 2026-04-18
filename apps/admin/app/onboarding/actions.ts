"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, Prisma } from "@repo/db";
import { auth } from "../../lib/auth";
import { partnerOnboardingSchema, type PartnerOnboardingValues } from "./schema";

export type CreatePartnerProfileResult = { success: false; error: string };

/** Mongo ObjectId string (24 hex chars) for `User.id` / `Partner.userId`. */
const OBJECT_ID_HEX = /^[a-f0-9]{24}$/i;

function normalizeOnboardingInput(
  input: PartnerOnboardingValues | PartnerOnboardingValues[] | unknown
): unknown {
  if (Array.isArray(input)) {
    return input[0] ?? {};
  }
  return input ?? {};
}

function isPrismaValidationError(e: unknown): e is Prisma.PrismaClientValidationError {
  return (
    e instanceof Prisma.PrismaClientValidationError ||
    (typeof e === "object" &&
      e !== null &&
      (e as { name?: string }).name === "PrismaClientValidationError")
  );
}

/** Prisma embeds the call site; Turbopack turns that into huge `__TURBOPACK__...` noise. */
function prismaValidationUserMessage(message: string): string {
  const lines = message.split("\n").map((l) => l.trimEnd());
  const useful = lines.filter(
    (l) =>
      l.length > 0 &&
      !l.includes("__TURBOPACK__") &&
      !/^Invalid `/.test(l) &&
      !/invocation in\s*$/.test(l)
  );
  const picked =
    useful.find((l) => /Unknown argument|Argument `|is missing|Did you mean|must not be null|Expected/i.test(l)) ??
    useful.find((l) => l.startsWith("→") || l.startsWith("Note:")) ??
    useful.slice(-5).join(" ").trim();
  const compact = picked.replace(/\s+/g, " ").trim().slice(0, 280);
  return compact.length > 0
    ? compact
    : "The server rejected the profile data. Please check the form or contact support.";
}

function prismaUserFacingMessage(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return "A partner profile already exists for this account. Try refreshing the page.";
    }
    return `Database could not save your profile (${e.code}). Please try again or contact support.`;
  }
  if (isPrismaValidationError(e)) {
    return prismaValidationUserMessage(e.message);
  }
  if (e instanceof Error && e.message) {
    return e.message.slice(0, 240);
  }
  return "Could not create your profile. Please try again or contact support.";
}

export async function createPartnerProfileAction(
  input: PartnerOnboardingValues | PartnerOnboardingValues[] | unknown
): Promise<CreatePartnerProfileResult | void> {
  const parsed = partnerOnboardingSchema.safeParse(normalizeOnboardingInput(input));
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.companyName?.[0] ??
      first.address?.[0] ??
      first.baseLocation?.[0] ??
      "Please check the form and try again.";
    return { success: false, error: msg };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }
  if (role !== "PARTNER") {
    return { success: false, error: "Only partner accounts can create a fleet profile." };
  }
  if (!OBJECT_ID_HEX.test(userId)) {
    return {
      success: false,
      error:
        "Your session is not compatible with the database (invalid user id). Please sign out and sign in again.",
    };
  }

  const existing = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) {
    redirect("/dashboard");
  }

  const { companyName, address, baseLocation } = parsed.data;
  const nameTrim = companyName.trim();
  const addressTrim = address.trim();
  const baseLocationTrim = baseLocation.trim();

  try {
    await prisma.partner.create({
      data: {
        userId,
        companyName: nameTrim,
        address: addressTrim,
        baseLocation: baseLocationTrim,
        maxRadius: 25,
        kycStatus: "PENDING",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { name: nameTrim },
    });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/settings/kyc");
  } catch (e) {
    console.error("[createPartnerProfileAction]", e);
    return {
      success: false,
      error: prismaUserFacingMessage(e),
    };
  }

  redirect("/dashboard");
}
