import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DEV_MASTER_OTP } from "@repo/api";
import { enterpriseAuthSecurity } from "@repo/auth";
import { prisma } from "@repo/db";
import { normalizeBookingsPhone } from "./phone";

/** + then 10–15 digits (E.164-style, India is 12 digits after +). */
const E164_LIKE = /^\+[1-9]\d{9,14}$/;

const userSelect = {
  id: true,
  name: true,
  role: true,
  phoneNumber: true,
} as const;

function toSessionUser(u: {
  id: string;
  name: string;
  role: string;
  phoneNumber: string | null;
}) {
  return {
    id: u.id,
    name: u.name ?? "",
    role: u.role,
    phoneNumber: u.phoneNumber ?? "",
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...enterpriseAuthSecurity,

  providers: [
    Credentials({
      id: "credentials",
      name: "Phone OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        try {
          const rawPhone = credentials?.phoneNumber as string | undefined;
          const otp = credentials?.otp as string | undefined;

          if (!rawPhone || !otp) {
            console.warn("[auth.authorize] missing phone or otp");
            return null;
          }

          const otpDigits = otp.replace(/\D/g, "");
          if (otpDigits !== DEV_MASTER_OTP) {
            console.warn("[auth.authorize] invalid otp (not master bypass)");
            return null;
          }

          const phoneNumber = normalizeBookingsPhone(rawPhone);
          if (!E164_LIKE.test(phoneNumber)) {
            console.warn("[auth.authorize] phone failed E.164 check", {
              rawPhone,
              normalized: phoneNumber,
            });
            return null;
          }

          const existing = await prisma.user.findUnique({
            where: { phoneNumber },
            select: userSelect,
          });

          if (existing) {
            return toSessionUser(existing);
          }

          try {
            const created = await prisma.user.create({
              data: {
                phoneNumber,
                role: "USER",
              },
              select: userSelect,
            });
            return toSessionUser(created);
          } catch (createErr) {
            console.warn(
              "[auth.authorize] user.create failed, retrying findUnique",
              createErr instanceof Error ? createErr.message : createErr,
            );
            const retry = await prisma.user.findUnique({
              where: { phoneNumber },
              select: userSelect,
            });
            if (retry) return toSessionUser(retry);
            throw createErr;
          }
        } catch (err) {
          console.error(
            "[auth.authorize]",
            err instanceof Error ? err.stack ?? err.message : err,
          );
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          if ("phoneNumber" in user && user.phoneNumber) {
            token.phoneNumber = user.phoneNumber as string;
          }
          if ("role" in user && user.role) {
            token.role = user.role as string;
          } else if (token.id) {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, phoneNumber: true },
            });
            token.role = dbUser?.role ?? "USER";
            if (dbUser?.phoneNumber) {
              token.phoneNumber = dbUser.phoneNumber;
            }
          }
        }
        return token;
      } catch (err) {
        console.error(
          "[auth.jwt]",
          err instanceof Error ? err.stack ?? err.message : err,
        );
        throw err;
      }
    },

    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      if (token.phoneNumber) {
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
