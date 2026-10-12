import "server-only";

import { prisma } from "@repo/db";

export async function logLeadActivity(params: {
  leadId: string;
  actorId?: string | null;
  kind: string;
  message: string;
  meta?: Record<string, unknown>;
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
