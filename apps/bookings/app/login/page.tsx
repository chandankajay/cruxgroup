import { userNeedsPinSetup } from "@repo/api";
import { auth } from "../../lib/auth";
import { LoginPageClient } from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{ setup?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await searchParams;
  const session = await auth();

  if (session?.user?.id && await userNeedsPinSetup(session.user.id)) {
    return <LoginPageClient initialStep="set_pin" />;
  }

  return <LoginPageClient />;
}
