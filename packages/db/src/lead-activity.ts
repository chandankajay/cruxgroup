import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "./client";

export async function logLeadActivity(params: {
  leadId: string;
  actorId?: string | null;
  kind: string;
  message: string;
  meta?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.leadActivity.create({
    data: {
      leadId: params.leadId,
      actorId: params.actorId ?? null,
      kind: params.kind,
      message: params.message,
      meta: params.meta ?? undefined,
    },
  });
}
