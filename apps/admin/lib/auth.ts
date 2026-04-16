import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/db";
import { authConfig } from "../auth.config";

// Comma-separated list of explicitly allowed email addresses.
// Takes precedence over domain restriction. Set via ALLOWED_ADMIN_EMAILS env var.
// Example: "you@gmail.com,colleague@gmail.com"
const ALLOWED_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ALLOWED_DOMAIN = "cruxgroup.in";

function isAllowed(email: string): boolean {
  const normalised = email.toLowerCase();
  if (ALLOWED_EMAILS.length > 0 && ALLOWED_EMAILS.includes(normalised)) {
    return true;
  }
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
      return isAllowed(user.email);
    },
    // Runs when a JWT is created (sign-in) or refreshed.
    // The `user` arg is only present on first sign-in — persist the DB id into token.
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // Runs every time session is read. With jwt strategy, `user` is undefined —
    // read the id from the token instead.
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
