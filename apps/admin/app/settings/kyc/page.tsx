import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { KycTrustCenterForm, type TrustCenterKycSnapshot } from "./kyc-trust-center-form";

export const dynamic = "force-dynamic";

export default async function PartnerTrustCenterKycPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "PARTNER") {
    return (
      <div className="max-w-xl rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-charcoal">Trust Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          KYC self-service is available to partner accounts. Admins can review partner
          documents from the Partners section.
        </p>
      </div>
    );
  }

  const partner = await prisma.partner.findUnique({
    where: { userId: session.user.id },
    select: {
      kycStatus: true,
      kycRejectionReason: true,
      updatedAt: true,
      panNumber: true,
      panDocUrl: true,
      aadhaarNumber: true,
      aadhaarDocUrl: true,
      gstNumber: true,
      bankAccountNumber: true,
      bankIfscCode: true,
      cancelledChequeUrl: true,
    },
  });

  if (!partner) {
    return (
      <div className="max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-950">Trust Center</h1>
        <p className="mt-2 text-sm text-amber-900">
          Your partner profile is not set up yet. Please contact Crux support so we can
          link your account before you submit KYC.
        </p>
      </div>
    );
  }

  const snapshot: TrustCenterKycSnapshot = {
    kycStatus: partner.kycStatus,
    kycRejectionReason: partner.kycRejectionReason,
    updatedAtIso: partner.updatedAt.toISOString(),
    panNumber: partner.panNumber,
    panDocUrl: partner.panDocUrl,
    aadhaarNumber: partner.aadhaarNumber,
    aadhaarDocUrl: partner.aadhaarDocUrl,
    gstNumber: partner.gstNumber,
    bankAccountNumber: partner.bankAccountNumber,
    bankIfscCode: partner.bankIfscCode,
    cancelledChequeUrl: partner.cancelledChequeUrl,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Trust Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload identity and payout documents. Information is stored securely; file
          storage uses Vercel Blob.
        </p>
      </div>

      <KycTrustCenterForm
        key={`kyc-trust-${snapshot.kycStatus}-${snapshot.updatedAtIso}`}
        snapshot={snapshot}
      />
    </div>
  );
}
