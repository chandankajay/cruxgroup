import type { NextAuthConfig } from "next-auth";
import { enterpriseAuthSecurity } from "@repo/auth";

/**
 * Edge-safe NextAuth config for bookings proxy (no Prisma).
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
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

    authorized() {
      // PIN setup is enforced server-side via PinSetupGuard (DB check).
      // Edge JWT may be stale right after PIN is saved.
      return true;
    },
  },
  ...enterpriseAuthSecurity,
};
