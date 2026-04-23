import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import { createOtp, verifyOtp } from "../services/otp-service";

/** Accepts +91…, 91…, or 10-digit local (stored as +91…). */
const phoneSchema = z
  .string()
  .transform((raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`;
    if (digits.length >= 10) return `+${digits}`;
    return raw;
  })
  .pipe(z.string().regex(/^\+[1-9]\d{9,14}$/, "Invalid phone number"));

export const authRouter = createRouter({
  sendOtp: publicProcedure
    .input(z.object({ phone: phoneSchema }))
    .mutation(async ({ input }) => {
      try {
        const code = await createOtp(input.phone);

        // Temporary simulated OTP flow: no live WhatsApp integration for now.
        // eslint-disable-next-line no-console
        console.log(`[SIMULATED OTP] ${input.phone}: ${code}`);

        return { success: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "OTP_ACCOUNT_LOCKED") {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many failed attempts. Try again after 15 minutes.",
          });
        }
        throw e;
      }
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: phoneSchema,
        code: z.string().min(4).max(12),
      })
    )
    .mutation(async ({ input }) => {
      const result = await verifyOtp(input.phone, input.code);
      return {
        verified: result.verified,
        lockedOut: result.lockedOut,
      };
    }),
});
