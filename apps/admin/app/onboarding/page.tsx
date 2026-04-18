import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { PartnerOnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function PartnerOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "PARTNER") {
    redirect("/dashboard");
  }

  const partner = await prisma.partner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (partner) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-charcoal">
        Welcome to Crux Group. Let&apos;s set up your fleet.
      </h1>
      <p className="mb-10 text-center text-sm text-muted-foreground">
        One quick step — then you can access your dashboard, KYC, and fleet tools.
      </p>
      <PartnerOnboardingForm />
    </div>
  );
}
