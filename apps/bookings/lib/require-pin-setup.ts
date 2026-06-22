import { redirect } from "next/navigation";
import { userNeedsPinSetup } from "@repo/api";
import { auth } from "./auth";

/** Redirect phone users who must complete mandatory PIN setup. */
export async function requirePinSetup(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !session.user.phoneNumber) return;

  if (await userNeedsPinSetup(session.user.id)) {
    redirect("/login?setup=pin");
  }
}
