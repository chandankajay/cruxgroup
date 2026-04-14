"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

// Placeholder until session-based auth is wired up.
// The booking service will upsert this user if it doesn't exist yet.
const DEV_GUEST_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

interface CreateBookingParams {
  equipmentId: string;
  address: string;
  pincode: string;
  startDate: string;
  endDate: string;
}

export async function createBookingAction(
  params: CreateBookingParams
): Promise<{ success: true; bookingId: string } | { success: false; error: string }> {
  try {
    const booking = await caller.booking.create({
      userId: DEV_GUEST_USER_ID,
      equipmentId: params.equipmentId,
      address: params.address,
      pincode: params.pincode,
      lat: 0,
      lng: 0,
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
