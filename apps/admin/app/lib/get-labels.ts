import "server-only";
import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function getAdminLabels(): Promise<Record<string, string>> {
  return caller.dictionary.getLabels({ app: "ADMIN" });
}
