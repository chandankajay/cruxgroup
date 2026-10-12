import "server-only";

import { prisma } from "./client";

const MAX_WINDOW_MS = 60 * 60 * 1000;

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const now = new Date();
  const window = Math.min(windowMs, MAX_WINDOW_MS);
  const expiresAt = new Date(now.getTime() + window);

  const existing = await prisma.rateLimitCounter.findUnique({
    where: { id: key },
    select: { count: true, expiresAt: true },
  });

  if (!existing || existing.expiresAt <= now) {
    await prisma.rateLimitCounter.upsert({
      where: { id: key },
      create: { id: key, count: 1, expiresAt },
      update: { count: 1, expiresAt },
    });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterMs: existing.expiresAt.getTime() - now.getTime(),
    };
  }

  await prisma.rateLimitCounter.update({
    where: { id: key },
    data: { count: { increment: 1 } },
  });
  return { ok: true };
}
