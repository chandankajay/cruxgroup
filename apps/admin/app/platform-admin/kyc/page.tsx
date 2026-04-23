import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import type { KycQueuePartnerRow } from "./types";
import { KycApprovalQueue } from "./features/kyc-approval-queue";
import {
  createKycDocViewToken,
  type KycDocKind,
} from "../../../lib/kyc-doc-view-token";

export const dynamic = "force-dynamic";

export default async function PlatformAdminKycPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) redirect("/login");
  if (role !== "ADMIN") redirect("/dashboard");

  const rows = await prisma.partner.findMany({
    where: { kycStatus: "SUBMITTED" },
    include: {
      user: {
        select: { phoneNumber: true, name: true, email: true },
      },
      _count: { select: { equipment: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  function docViewPath(partnerId: string, kind: KycDocKind, stored: string | null): string | null {
    if (!stored) return null;
    const token = createKycDocViewToken(partnerId, kind);
    return `/api/kyc/view/${encodeURIComponent(token)}`;
  }

  const initialRows: KycQueuePartnerRow[] = rows.map((p) => ({
    id: p.id,
    companyName: p.companyName,
    address: p.address,
    baseLocation: p.baseLocation,
    maxRadius: p.maxRadius,
    updatedAt: p.updatedAt.toISOString(),
    panNumber: p.panNumber,
    aadhaarNumber: p.aadhaarNumber,
    gstNumber: p.gstNumber,
    bankAccountNumber: p.bankAccountNumber,
    bankIfscCode: p.bankIfscCode,
    panDocViewPath: docViewPath(p.id, "pan", p.panDocUrl),
    aadhaarDocViewPath: docViewPath(p.id, "aadhaar", p.aadhaarDocUrl),
    cancelledChequeViewPath: docViewPath(p.id, "cheque", p.cancelledChequeUrl),
    user: p.user,
    equipmentCount: p._count.equipment,
  }));

  return <KycApprovalQueue initialRows={initialRows} />;
}
