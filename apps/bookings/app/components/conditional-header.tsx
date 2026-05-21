import { auth } from "../../lib/auth";
import { ConditionalHeaderClient } from "./conditional-header-client";

export async function ConditionalHeader() {
  const session = await auth();
  return <ConditionalHeaderClient session={session} />;
}
