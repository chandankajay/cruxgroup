"use server";

import { createCaller } from "@repo/api";
import { auth } from "../../lib/auth";

const caller = createCaller({});

interface CreateBookingParams {
  equipmentId: string;
  address: string;
  pincode: string;
  lat: number;
  lng: number;
  pricingUnit: "daily" | "hourly";
  duration: number;
  startDate: string;
  endDate: string;
}

export async function createBookingAction(
  params: CreateBookingParams
): Promise<{ success: true; bookingId: string } | { success: false; error: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Please login before booking equipment." };
    }

    const booking = await caller.booking.create({
      userId,
      equipmentId: params.equipmentId,
      address: params.address,
      pincode: params.pincode,
      lat: params.lat,
      lng: params.lng,
      pricingUnit: params.pricingUnit,
      duration: params.duration,
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not save your booking. Please try again.";
    return { success: false, error: message };
  }
}
