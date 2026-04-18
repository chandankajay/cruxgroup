import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { DashboardHome } from "./features/dashboard-home";
import { PartnerCommandCenter } from "./features/partner-command-center";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const role = (session.user as { role?: string } | undefined)?.role ?? "ADMIN";

  if (role === "PARTNER") {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true, companyName: true, kycStatus: true },
    });
    if (!partner) redirect("/onboarding");

    const [total, active, pending] = await Promise.all([
      prisma.equipment.count({ where: { partnerId: partner.id } }),
      prisma.equipment.count({ where: { partnerId: partner.id, isActive: true } }),
      prisma.equipment.count({ where: { partnerId: partner.id, isActive: false } }),
    ]);

    return (
      <PartnerCommandCenter
        companyName={partner.companyName}
        kycStatus={partner.kycStatus}
        fleet={{ total, active, pending }}
        mockMetrics={{ totalEarnings: 0, activeTrips: 0, utilizationPct: 0 }}
      />
    );
  }

  return <DashboardHome />;
}
