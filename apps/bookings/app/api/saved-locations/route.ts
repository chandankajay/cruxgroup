import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { auth } from "../../../lib/auth";
import { getOrCreateB2cCustomer } from "../../../lib/get-or-create-b2c-customer";

export type SavedLocationDto = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  pincode: string;
};

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await prisma.customer.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    return NextResponse.json({ locations: [] satisfies SavedLocationDto[] });
  }

  const rows = await prisma.savedLocation.findMany({
    where: { customerId: customer.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      label: true,
      address: true,
      lat: true,
      lng: true,
      pincode: true,
    },
  });

  return NextResponse.json({ locations: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const address = typeof o.address === "string" ? o.address.trim() : "";
  const lat = typeof o.lat === "number" ? o.lat : Number(o.lat);
  const lng = typeof o.lng === "number" ? o.lng : Number(o.lng);
  const pincode =
    typeof o.pincode === "string" ? o.pincode.replace(/\D/g, "").slice(0, 6) : "";
  const label =
    typeof o.label === "string" ? o.label.trim().slice(0, 120) : "";

  if (!address || address.length > 2000) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng must be numbers" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "coordinates out of range" }, { status: 400 });
  }

  const customer = await getOrCreateB2cCustomer(userId);
  if (!customer) {
    return NextResponse.json(
      { error: "Add a phone number to your account before saving locations." },
      { status: 400 }
    );
  }

  const created = await prisma.savedLocation.create({
    data: {
      customerId: customer.id,
      label,
      address,
      lat,
      lng,
      pincode,
    },
    select: {
      id: true,
      label: true,
      address: true,
      lat: true,
      lng: true,
      pincode: true,
    },
  });

  return NextResponse.json({ location: created });
}
