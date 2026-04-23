import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { auth } from "../../../../lib/auth";
import { getLiveJobsPayload, syncTripOverruns } from "../../../../lib/jobs-live";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (role === "ADMIN") {
    await syncTripOverruns();
    const data = await getLiveJobsPayload();
    return NextResponse.json(data);
  }

  if (role === "PARTNER") {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 403 });
    }
    // Do not run global overrun sync on partner requests — it mutates all partners' trips.
    const data = await getLiveJobsPayload(partner.id);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
