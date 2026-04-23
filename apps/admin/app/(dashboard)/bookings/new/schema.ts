import { z } from "zod";

export const walkInBookingSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    customerId: z.string().optional(),
    newName: z.string().optional(),
    newPhone: z.string().optional(),
    newCompany: z.string().optional(),
    newGstin: z.string().optional(),
    equipmentId: z.string().min(1, "Select a machine"),
    siteAddress: z.string().min(3, "Site address is required"),
    pincode: z.string().min(3, "Pincode is required"),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    pricingUnit: z.enum(["hourly", "daily"]),
    duration: z.coerce.number().positive(),
    startLocal: z.string().min(1, "Start date/time (IST) is required"),
    endLocal: z.string().min(1, "End date/time (IST) is required"),
    expectedShift: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "existing") {
      if (!data.customerId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a customer",
          path: ["customerId"],
        });
      }
    } else {
      if (!data.newName || data.newName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required",
          path: ["newName"],
        });
      }
      if (!data.newPhone || data.newPhone.replace(/\D/g, "").length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid phone is required",
          path: ["newPhone"],
        });
      }
    }
  });

export type WalkInBookingValues = z.infer<typeof walkInBookingSchema>;

/** Reschedule walk-in / linked job: only schedule fields are mutable on update. */
export const walkInRescheduleSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  tripId: z.string().min(1, "Trip is required"),
  startLocal: z.string().min(1, "Start date/time (IST) is required"),
  endLocal: z.string().min(1, "End date/time (IST) is required"),
  expectedShift: z.string().optional(),
});

export type WalkInRescheduleValues = z.infer<typeof walkInRescheduleSchema>;
