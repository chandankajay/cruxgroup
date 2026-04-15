import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import {
  createBooking,
  listBookings,
  updateBookingStatus,
} from "../services/booking-service";

const BookingStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "COMPLETED",
  "CANCELLED",
]);

export const bookingRouter = createRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        equipmentId: z.string(),
        address: z.string().min(1),
        pincode: z.string().min(4),
        lat: z.number(),
        lng: z.number(),
        pricingUnit: z.enum(["daily", "hourly"]),
        duration: z.number().positive(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }
      return createBooking(input);
    }),

  getAll: publicProcedure.query(() => listBookings()),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: BookingStatusEnum,
      })
    )
    .mutation(({ input }) => updateBookingStatus(input.id, input.status)),
});
