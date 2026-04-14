import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import { createOtp, verifyOtp } from "../services/otp-service";
import { sendWhatsAppOtp } from "../services/aisensy-service";

const phoneSchema = z
  .string()
  .regex(/^\d{10,15}$/, "Invalid phone number");

export const authRouter = createRouter({
  sendOtp: publicProcedure
    .input(z.object({ phone: phoneSchema }))
    .mutation(async ({ input }) => {
      const code = await createOtp(input.phone);

      if (process.env["NODE_ENV"] === "development") {
        // eslint-disable-next-line no-console
        console.log(`[DEV] OTP for ${input.phone}: ${code}`);
      } else {
        await sendWhatsAppOtp({ phone: input.phone, otp: code });
      }

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
      const DEV_MAGIC_CODE = "123456";
      const isDev = process.env["NODE_ENV"] === "development";

      if (isDev && input.code === DEV_MAGIC_CODE) {
        return { verified: true };
      }

      const valid = await verifyOtp(input.phone, input.code);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired OTP",
        });
      }

      return { verified: true };
    }),
});
