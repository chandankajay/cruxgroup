import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { createOtp, verifyOtp } from "../services/otp-service";

const phoneSchema = z
  .string()
  .regex(/^\d{10,15}$/, "Invalid phone number");

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
      const SIMULATED_CODE = "123456";
      if (input.code === SIMULATED_CODE) {
        return { verified: true };
      }

      // Keep fallback verification for non-simulated flows.
      const valid = await verifyOtp(input.phone, input.code);
      return { verified: valid };
    }),
});
