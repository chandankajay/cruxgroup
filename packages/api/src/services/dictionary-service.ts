import { prisma } from "@repo/db";
import type { DictionaryApp } from "@repo/db";

export async function getLabelsForApp(
  app: DictionaryApp,
  language = "en"
): Promise<Record<string, string>> {
  try {
    const entries = await prisma.dictionary.findMany({
      where: { app, language },
      select: { key: true, value: true },
    });

    const labels: Record<string, string> = {};
    for (const entry of entries) {
      labels[entry.key] = entry.value;
    }
    return labels;
  } catch {
    return {};
  }
}
