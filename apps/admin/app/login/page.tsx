import { signIn } from "../../lib/auth";
import { safeCallbackPath } from "../../lib/booking-response-routes";
import { LoginClient } from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccessDenied = params.error === "AccessDenied";
  const isConfiguration = params.error === "Configuration";
  const callbackUrl = safeCallbackPath(params.callbackUrl) ?? "/";

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
    />
  );
}
