import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { createOtp, verifyOtp, DEV_MASTER_OTP } from "../services/otp-service";

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
      const code = await createOtp(input.phone);

      // Temporary simulated OTP flow: no live WhatsApp integration for now.
      // eslint-disable-next-line no-console
      console.log(`[SIMULATED OTP] ${input.phone}: ${code}`);

      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: phoneSchema,
        code: z.string().length(6),
      })
    )
    .mutation(async ({ input }) => {
      const codeDigits = input.code.replace(/\D/g, "");
      if (codeDigits === DEV_MASTER_OTP) {
        return { verified: true };
      }

      const valid = await verifyOtp(input.phone, input.code);
      return { verified: valid };
    }),
});
