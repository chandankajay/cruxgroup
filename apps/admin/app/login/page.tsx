import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { signIn, auth } from "../../lib/auth";
import { safeCallbackPath } from "../../lib/booking-response-routes";
import { LoginClient } from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string; setup?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccessDenied = params.error === "AccessDenied";
  const isConfiguration = params.error === "Configuration";
  const callbackUrl = safeCallbackPath(params.callbackUrl) ?? "/";
  const session = await auth();

  let pinSetupRequired = false;
  if (session?.user?.id && session.user.phoneNumber) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pinHash: true },
    });
    pinSetupRequired = !user?.pinHash;
  }

  if (session?.user?.id && pinSetupRequired && params.setup !== "pin") {
    redirect("/login?setup=pin");
  }

  async function googleLoginAction() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <LoginClient
      isAccessDenied={isAccessDenied}
      isConfiguration={isConfiguration}
      callbackUrl={callbackUrl}
      googleLoginAction={googleLoginAction}
      pinSetupRequired={pinSetupRequired}
    />
  );
}
