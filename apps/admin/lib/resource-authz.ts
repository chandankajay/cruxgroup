import type { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import { auth } from "./auth";

/**
 * Resolved authorization context for Partner OS resource access.
 * - ADMIN: platform scope (no partnerId filter).
 * - PARTNER: must be tied to a Partner row; all resource checks include partnerId (or equivalent joins).
 */
export type ResourceAuthzContext =
  | { readonly role: "ADMIN"; readonly userId: string }
  | { readonly role: "PARTNER"; readonly userId: string; readonly partnerId: string };

export type AuthorizedResourceSpec =
  | { readonly resource: "Equipment"; readonly targetId: string }
  | { readonly resource: "Booking"; readonly targetId: string }
  | { readonly resource: "Trip"; readonly targetId: string }
  | { readonly resource: "Invoice"; readonly targetId: string }
  | { readonly resource: "MachineServiceLog"; readonly targetId: string };

/**
 * Builds a Prisma `where` fragment so that:
 * - PARTNER: row must belong to the signed-in partner (`partnerId` on the model, or via relations).
 * - ADMIN: row is addressed by primary id only (super-admin override).
 *
 * Use with `findFirst`, `updateMany`, `deleteMany`, or `count` — not with `findUnique`/`delete`/`update`
 * unless you have a compound unique on (id, partnerId).
 */
export function getAuthorizedWhereClause(
  ctx: ResourceAuthzContext,
  spec: AuthorizedResourceSpec
):
  | Prisma.EquipmentWhereInput
  | Prisma.BookingWhereInput
  | Prisma.TripWhereInput
  | Prisma.InvoiceWhereInput
  | Prisma.MachineServiceLogWhereInput {
  const { resource, targetId } = spec;

  if (ctx.role === "ADMIN") {
    switch (resource) {
      case "Equipment":
        return { id: targetId };
      case "Booking":
        return { id: targetId };
      case "Trip":
        return { id: targetId };
      case "Invoice":
        return { id: targetId };
      case "MachineServiceLog":
        return { id: targetId };
      default: {
        const _exhaustive: never = resource;
        return _exhaustive;
      }
    }
  }

  switch (resource) {
    case "Equipment":
      return { id: targetId, partnerId: ctx.partnerId };
    case "Booking":
      return {
        id: targetId,
        OR: [
          { partnerId: ctx.partnerId },
          {
            partnerId: null,
            equipment: { partnerId: ctx.partnerId },
          },
        ],
      };
    case "Trip":
      return { id: targetId, partnerId: ctx.partnerId };
    case "Invoice":
      return { id: targetId, trip: { partnerId: ctx.partnerId } };
    case "MachineServiceLog":
      return { id: targetId, equipment: { partnerId: ctx.partnerId } };
    default: {
      const _exhaustive: never = resource;
      return _exhaustive;
    }
  }
}

/**
 * Loads session-backed context for IDOR-safe queries.
 * Returns null if unauthenticated, unknown role, or PARTNER without a Partner profile.
 */
export async function getResourceAuthzContext(): Promise<ResourceAuthzContext | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") {
    return { role: "ADMIN", userId };
  }
  if (role === "PARTNER") {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!partner) return null;
    return { role: "PARTNER", userId, partnerId: partner.id };
  }
  return null;
}

/** Admin-only guard for catalog / global booking tools. */
export async function requireAdminResourceAuthz(): Promise<
  Extract<ResourceAuthzContext, { role: "ADMIN" }> | null
> {
  const ctx = await getResourceAuthzContext();
  if (!ctx || ctx.role !== "ADMIN") return null;
  return ctx;
}

/** Maps walk-in desk / similar server-only actor shapes to {@link ResourceAuthzContext}. */
export function toResourceAuthzContext(
  actor:
    | { readonly kind: "ADMIN"; readonly userId: string }
    | { readonly kind: "PARTNER"; readonly userId: string; readonly partnerId: string }
): ResourceAuthzContext {
  if (actor.kind === "ADMIN") {
    return { role: "ADMIN", userId: actor.userId };
  }
  return { role: "PARTNER", userId: actor.userId, partnerId: actor.partnerId };
}
