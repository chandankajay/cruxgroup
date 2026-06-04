import { Suspense } from "react";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { PartnerLegalGate } from "../../components/onboarding/partner-legal-gate";
import { PartnerLegalTermsContent } from "../../components/onboarding/partner-legal-terms-content";
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
    select: { id: true, termsAcceptedAt: true },
  });

  if (partner?.termsAcceptedAt) {
    redirect("/dashboard");
  }

  if (partner) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-2xl flex-col justify-center px-4 py-16">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-charcoal">
          Partner agreement
        </h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          One last step before your dashboard, KYC submission, and fleet tools.
        </p>
        <PartnerLegalGate
          termsContent={
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading terms…</p>
              }
            >
              <PartnerLegalTermsContent />
            </Suspense>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-charcoal">
        Welcome to Crux Group. Let&apos;s set up your fleet.
      </h1>
      <p className="mb-10 text-center text-sm text-muted-foreground">
        Tell us about your yard — then review and accept our partner terms.
      </p>
      <PartnerOnboardingForm />
    </div>
  );
}
