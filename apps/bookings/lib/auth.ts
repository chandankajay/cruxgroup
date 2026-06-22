import NextAuth from "next-auth";
import type { NextAuthConfig, NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp, verifyPin, isPinLocked } from "@repo/api";
import { enterpriseAuthSecurity } from "@repo/auth";
import { prisma } from "@repo/db";
import { sendWhatsAppMessage } from "@repo/lib";
import { normalizeBookingsPhone } from "./phone";

const E164_LIKE = /^\+[1-9]\d{9,14}$/;

const userSelect = {
  id: true,
  name: true,
  role: true,
  phoneNumber: true,
  welcomeNoteSentAt: true,
  pinHash: true,
  pinLockoutUntil: true,
} as const;

function toSessionUser(u: {
  id: string;
  name: string;
  role: string;
  phoneNumber: string | null;
  pinHash?: string | null;
}) {
  return {
    id: u.id,
    name: u.name ?? "",
    role: u.role,
    phoneNumber: u.phoneNumber ?? "",
    pinSet: !!u.pinHash,
  };
}

async function applyDbUserToToken(token: {
  id?: string;
  role?: string;
  phoneNumber?: string;
  pinSet?: boolean;
}) {
  if (!token.id) return;

  const dbUser = await prisma.user.findUnique({
    where: { id: token.id },
    select: { role: true, phoneNumber: true, pinHash: true },
  });

  if (dbUser?.role) token.role = dbUser.role;
  if (dbUser?.phoneNumber) {
    token.phoneNumber = dbUser.phoneNumber;
    token.pinSet = !!dbUser.pinHash;
  }
}

const authConfig = {
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
          if (!rawPhone || !otp) return null;

          const phoneNumber = normalizeBookingsPhone(rawPhone);
          const otpResult = await verifyOtp(phoneNumber, otp);
          if (otpResult.lockedOut || !otpResult.verified) return null;
          if (!E164_LIKE.test(phoneNumber)) return null;

          let row = await prisma.user.findUnique({
            where: { phoneNumber },
            select: userSelect,
          });

          if (!row) {
            try {
              row = await prisma.user.create({
                data: { phoneNumber, role: "USER" },
                select: userSelect,
              });
            } catch {
              row = await prisma.user.findUnique({
                where: { phoneNumber },
                select: userSelect,
              });
            }
          }

          if (!row) return null;

          if (!row.welcomeNoteSentAt) {
            const welcomeTemplate =
              process.env["AISENSY_WELCOME_TEMPLATE_NAME"] ?? "welcome_note";
            const ok = await sendWhatsAppMessage(phoneNumber, welcomeTemplate, [
              row.name?.trim() || "Customer",
            ]);
            if (ok) {
              await prisma.user.update({
                where: { id: row.id },
                data: { welcomeNoteSentAt: new Date() },
              });
            }
          }

          return toSessionUser(row);
        } catch (err) {
          console.error("[auth.authorize]", err);
          return null;
        }
      },
    }),

    Credentials({
      id: "pin",
      name: "Phone PIN",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        try {
          const rawPhone = credentials?.phoneNumber as string | undefined;
          const pin = credentials?.pin as string | undefined;
          if (!rawPhone || !pin) return null;

          const phoneNumber = normalizeBookingsPhone(rawPhone);
          if (!E164_LIKE.test(phoneNumber)) return null;

          const row = await prisma.user.findUnique({
            where: { phoneNumber },
            select: userSelect,
          });

          if (!row?.pinHash || isPinLocked(row)) return null;

          const pinResult = await verifyPin(row.id, pin);
          if (!pinResult.ok) return null;

          return toSessionUser(row);
        } catch (err) {
          console.error("[auth.pin.authorize]", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ("phoneNumber" in user && user.phoneNumber) {
          token.phoneNumber = user.phoneNumber as string;
        }
        if ("role" in user && user.role) {
          token.role = user.role as string;
        }
        if ("pinSet" in user) {
          token.pinSet = !!user.pinSet;
        }
      }
      await applyDbUserToToken(token);
      return token;
    },

    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      if (token.phoneNumber) {
        session.user.phoneNumber = token.phoneNumber as string;
      }
      if (typeof token.pinSet === "boolean") {
        session.user.pinSet = token.pinSet;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

const nextAuth = NextAuth(authConfig) as NextAuthResult;

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
