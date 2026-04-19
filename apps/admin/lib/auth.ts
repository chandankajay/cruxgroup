import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { DEV_MASTER_OTP } from "@repo/api";
import { prisma } from "@repo/db";
import { authConfig } from "../auth.config";
import { ADMIN_PHONE_E164, normalizeAdminPhone } from "./phone";

const partnerUserSelect = {
  id: true,
  name: true,
  role: true,
  phoneNumber: true,
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

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        const otpDigits = otp.replace(/\D/g, "");
        if (otpDigits !== DEV_MASTER_OTP) return null;

        const phoneNumber = normalizeAdminPhone(rawPhone);
        if (!ADMIN_PHONE_E164.test(phoneNumber)) return null;

        let user = await prisma.user.findUnique({
          where: { phoneNumber },
          select: partnerUserSelect,
        });

        // After valid master OTP: same behaviour as local — new numbers self-register
        // as PARTNER (then onboarding creates the Partner profile). Existing USERs
        // logging in via phone are promoted to PARTNER so they are not sent to the
        // public bookings app (middleware treats USER as bookings-only).
        if (!user) {
          try {
            user = await prisma.user.create({
              data: {
                phoneNumber,
                name: "",
                role: "PARTNER",
              },
              select: partnerUserSelect,
            });
          } catch {
            user = await prisma.user.findUnique({
              where: { phoneNumber },
              select: partnerUserSelect,
            });
          }
        } else if (user.role === "USER") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "PARTNER" },
            select: partnerUserSelect,
          });
        }

        if (!user || (user.role !== "PARTNER" && user.role !== "ADMIN")) {
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
      if (dbUser?.role === "PARTNER" || dbUser?.role === "ADMIN") return true;

      // Regular USERs are not allowed into the admin app.
      if (dbUser?.role === "USER" && !isAllowedAdmin(email)) return false;

      // New Google user — allow only explicitly listed admin emails.
      return isAllowedAdmin(email);
    },

    // ── jwt ───────────────────────────────────────────────────────────────
    // Runs on sign-in and token refresh. Persists id + role into the JWT.
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;

        if ("phoneNumber" in user && user.phoneNumber) {
          token.phoneNumber = user.phoneNumber as string;
        }

        // For Credentials the role is already in the user object returned by
        // authorize(). For Google we need to look it up.
        if ("role" in user && user.role) {
          const email = (user as { email?: string }).email ?? "";
          const rawRole = user.role as string;
          // Bootstrap: allowlisted Google users not yet promoted → ADMIN.
          if (rawRole === "USER" && isAllowedAdmin(email)) {
            token.role = "ADMIN";
          } else {
            token.role = rawRole;
          }
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, email: true, phoneNumber: true },
          });
          const email = dbUser?.email ?? "";
          if ((!dbUser?.role || dbUser.role === "USER") && isAllowedAdmin(email)) {
            token.role = "ADMIN";
          } else {
            token.role = dbUser?.role ?? "USER";
          }
          if (dbUser?.phoneNumber) {
            token.phoneNumber = dbUser.phoneNumber;
          }
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
      return session;
    },
  },
});
