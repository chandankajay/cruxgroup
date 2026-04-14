import "server-only";
import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function getBookingLabels(): Promise<Record<string, string>> {
  return caller.dictionary.getLabels({ app: "BOOKING" });
}
