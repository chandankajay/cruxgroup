import NextAuth, { type NextAuthResult } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { verifyOtp, verifyPin, isPinLocked } from "@repo/api";
import { prisma } from "@repo/db";
import { authConfig } from "../auth.config";
import { ADMIN_PHONE_E164, normalizeAdminPhone } from "./phone";

const partnerUserSelect = {
  id: true,
  name: true,
  role: true,
  phoneNumber: true,
  pinHash: true,
  pinLockoutUntil: true,
} as const;

// Comma-separated list of explicitly allowed email addresses.
// These are the bootstrap admin emails that can log in even before their
// role is set to ADMIN in the database.
const ALLOWED_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ALLOWED_DOMAIN = "cruxgroup.in";

function isAllowedAdmin(email: string): boolean {
  const normalised = email.toLowerCase();
  if (ALLOWED_EMAILS.length > 0 && ALLOWED_EMAILS.includes(normalised))
    return true;
  return normalised.endsWith(`@${ALLOWED_DOMAIN}`);
}

const nextAuth: NextAuthResult = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // ── Google ── for ADMIN role login ────────────────────────────────────
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    }),

    // ── Phone OTP ── for PARTNER role login ───────────────────────────────
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const rawPhone = credentials?.phoneNumber as string | undefined;
        const otp = credentials?.otp as string | undefined;

        if (!rawPhone || !otp) return null;

        const phoneNumber = normalizeAdminPhone(rawPhone);
        const otpResult = await verifyOtp(phoneNumber, otp);
        if (otpResult.lockedOut || !otpResult.verified) return null;

        if (!ADMIN_PHONE_E164.test(phoneNumber)) return null;

        let user = await prisma.user.findUnique({
          where: { phoneNumber },
          select: partnerUserSelect,
        });

        // New numbers self-register as USER and pick Partner vs Sales on first login.
        if (!user) {
          try {
            user = await prisma.user.create({
              data: {
                phoneNumber,
                name: "",
                role: "USER",
              },
              select: partnerUserSelect,
            });
          } catch {
            user = await prisma.user.findUnique({
              where: { phoneNumber },
              select: partnerUserSelect,
            });
          }
        }

        const allowedRoles = ["USER", "PARTNER", "SALES", "ADMIN"] as const;
        if (!user || !allowedRoles.includes(user.role as (typeof allowedRoles)[number])) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? "",
          role: user.role,
          phoneNumber: user.phoneNumber ?? phoneNumber,
        };
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
        const rawPhone = credentials?.phoneNumber as string | undefined;
        const pin = credentials?.pin as string | undefined;

        if (!rawPhone || !pin) return null;

        const phoneNumber = normalizeAdminPhone(rawPhone);
        if (!ADMIN_PHONE_E164.test(phoneNumber)) return null;

        const user = await prisma.user.findUnique({
          where: { phoneNumber },
          select: partnerUserSelect,
        });

        if (!user?.pinHash) return null;
        if (isPinLocked(user)) return null;

        const pinResult = await verifyPin(user.id, pin);
        if (!pinResult.ok) return null;

        const allowedRoles = ["USER", "PARTNER", "SALES", "ADMIN"] as const;
        if (!allowedRoles.includes(user.role as (typeof allowedRoles)[number])) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? "",
          role: user.role,
          phoneNumber: user.phoneNumber ?? phoneNumber,
        };
      },
    }),
  ],

  callbacks: {
    // ── signIn ────────────────────────────────────────────────────────────
    async signIn({ user, account }) {
      // Credentials users are fully validated inside authorize() above.
      if (account?.type === "credentials") return !!user;

      // Google flow: enforce email allowlist.
      if (!user.email) return false;
      const email = user.email.toLowerCase();

      const dbUser = await prisma.user.findFirst({
        where: { email },
        select: { role: true },
      });

      // Existing elevated roles always pass.
      if (dbUser?.role === "PARTNER" || dbUser?.role === "ADMIN" || dbUser?.role === "SALES") {
        return true;
      }

      // Regular USERs are not allowed into the admin app.
      if (dbUser?.role === "USER" && !isAllowedAdmin(email)) return false;

      // New Google user — allow only explicitly listed admin emails.
      return isAllowedAdmin(email);
    },

    // ── jwt ───────────────────────────────────────────────────────────────
    // Runs on sign-in and token refresh. Persists id + role into the JWT.
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session && typeof session === "object") {
        const patch = session as { role?: string };
        if (patch.role) {
          token.role = patch.role;
          return token;
        }
      }

      if (user?.id) {
        token.id = user.id;

        if ("phoneNumber" in user && user.phoneNumber) {
          token.phoneNumber = user.phoneNumber as string;
        }
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, email: true, phoneNumber: true, pinHash: true },
        });
        const email = dbUser?.email ?? "";
        if ((!dbUser?.role || dbUser.role === "USER") && isAllowedAdmin(email)) {
          token.role = "ADMIN";
        } else {
          token.role = dbUser?.role ?? "USER";
        }
        if (dbUser?.phoneNumber) {
          token.phoneNumber = dbUser.phoneNumber;
          token.pinSet = !!dbUser.pinHash;
        }
      }
      return token;
    },

    // ── session ───────────────────────────────────────────────────────────
    // Mirror of the edge session callback — ensures server-side auth() also
    // returns id and role on session.user.
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
});

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
