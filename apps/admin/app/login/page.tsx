import { signIn } from "../../lib/auth";
import { LoginClient } from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccessDenied = params.error === "AccessDenied";
  const isConfiguration = params.error === "Configuration";

  async function googleLoginAction() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <LoginClient
      isAccessDenied={isAccessDenied}
      isConfiguration={isConfiguration}
      googleLoginAction={googleLoginAction}
    />
  );
}
