import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import type { KycQueuePartnerRow } from "./types";
import { KycApprovalQueue } from "./features/kyc-approval-queue";

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

  const initialRows: KycQueuePartnerRow[] = rows.map((p) => ({
    id: p.id,
    companyName: p.companyName,
    address: p.address,
    baseLocation: p.baseLocation,
    maxRadius: p.maxRadius,
    updatedAt: p.updatedAt.toISOString(),
    panNumber: p.panNumber,
    panDocUrl: p.panDocUrl,
    aadhaarNumber: p.aadhaarNumber,
    aadhaarDocUrl: p.aadhaarDocUrl,
    gstNumber: p.gstNumber,
    bankAccountNumber: p.bankAccountNumber,
    bankIfscCode: p.bankIfscCode,
    cancelledChequeUrl: p.cancelledChequeUrl,
    user: p.user,
    equipmentCount: p._count.equipment,
  }));

  return <KycApprovalQueue initialRows={initialRows} />;
}
