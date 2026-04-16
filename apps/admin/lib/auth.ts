import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/db";
import { authConfig } from "../auth.config";

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
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();

      // Check if this email already has an elevated role in the DB.
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });

      if (dbUser?.role === "PARTNER" || dbUser?.role === "ADMIN") return true;

      // Regular USERs are not allowed into the admin app.
      if (dbUser?.role === "USER" && !isAllowedAdmin(email)) return false;

      // New user (not in DB) — allow only explicitly listed admin emails.
      return isAllowedAdmin(email);
    },

    // Runs when a JWT is minted (sign-in) or refreshed.
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, email: true },
        });

        const email = dbUser?.email ?? "";

        // Allowlisted emails that haven't been promoted yet → treat as ADMIN.
        if (
          (!dbUser?.role || dbUser.role === "USER") &&
          isAllowedAdmin(email)
        ) {
          token.role = "ADMIN";
        } else {
          token.role = dbUser?.role ?? "USER";
        }
      }
      return token;
    },

    // Mirror of the edge session callback — ensures server-side auth() also
    // returns id and role on session.user.
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
});
