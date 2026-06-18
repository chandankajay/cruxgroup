import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "../../lib/auth";
import { LoginPageClient } from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{ setup?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user?.id && params.setup === "pin") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pinHash: true, phoneNumber: true },
    });
    if (user?.phoneNumber && !user.pinHash) {
      return <LoginPageClient initialStep="set_pin" initialPinMode="setup" />;
    }
    redirect("/");
  }

  if (session?.user?.id && session.user.phoneNumber && session.user.pinSet === false) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pinHash: true },
    });
    if (!user?.pinHash) {
      return <LoginPageClient initialStep="set_pin" initialPinMode="setup" />;
    }
  }

  return <LoginPageClient />;
}
