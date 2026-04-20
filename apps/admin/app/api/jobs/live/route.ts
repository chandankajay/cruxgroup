import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getLiveJobsPayload, syncTripOverruns } from "../../../../lib/jobs-live";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await syncTripOverruns();
  const data = await getLiveJobsPayload();
  return NextResponse.json(data);
}
