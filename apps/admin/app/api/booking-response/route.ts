import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { advanceBookingProgress } from "@repo/lib";

export async function POST(req: NextRequest) {
  let body: { token?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, action } = body;

  if (!token || !action || !["ACCEPTED", "DECLINED"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const responseToken = await prisma.bookingResponseToken.findUnique({
    where: { token },
    include: { booking: true },
  });

  if (!responseToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }
  if (responseToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }
  if (responseToken.usedAt) {
    return NextResponse.json({ error: "Already responded" }, { status: 409 });
  }

  await prisma.bookingResponseToken.update({
    where: { token },
    data: {
      usedAt: new Date(),
      response: action as "ACCEPTED" | "DECLINED",
    },
  });

  if (action === "ACCEPTED") {
    await prisma.booking.update({
      where: { id: responseToken.bookingId },
      data: {
        partnerId: responseToken.partnerId,
        status: "PARTNER_ACCEPTED",
      },
    });

    try {
      await advanceBookingProgress(responseToken.bookingId, "BOOKING_CONFIRMED");
    } catch (err) {
      console.error("[booking-response] progress_hook_failed", err);
    }

    await prisma.bookingResponseToken.updateMany({
      where: {
        bookingId: responseToken.bookingId,
        id: { not: responseToken.id },
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
        response: "DECLINED",
      },
    });
  }

  if (action === "DECLINED") {
    const remaining = await prisma.bookingResponseToken.count({
      where: {
        bookingId: responseToken.bookingId,
        usedAt: null,
        id: { not: responseToken.id },
      },
    });

    if (remaining === 0) {
      await prisma.booking.update({
        where: { id: responseToken.bookingId },
        data: { status: "PARTNER_DECLINED" },
      });
    } else {
      await prisma.booking.update({
        where: { id: responseToken.bookingId },
        data: { status: "PENDING_PARTNER" },
      });
    }
  }

  return NextResponse.json({ success: true });
}
