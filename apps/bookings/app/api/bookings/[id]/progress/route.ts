import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { fetchBookingProgress } from "@repo/lib";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const progress = await fetchBookingProgress(id, userId);
  if (!progress) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(progress);
}
