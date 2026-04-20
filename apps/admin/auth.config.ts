import type { NextAuthConfig } from "next-auth";
import { enterpriseAuthSecurity } from "@repo/auth";

const PARTNER_ONLY = ["/fleet", "/my-bookings", "/service-area", "/earnings"];

function isPartnerBlockedFromPath(pathname: string): boolean {
  if (pathname.startsWith("/platform-admin")) return true;
  if (["/equipment", "/bookings", "/partners"].some((p) => pathname.startsWith(p))) {
    return true;
  }
  if (pathname.startsWith("/settings") && !pathname.startsWith("/settings/kyc")) {
    return true;
  }
  return false;
}

/**
 * Edge-compatible NextAuth config.
 * Must NOT import anything from @repo/db or @prisma/client — this file
 * is bundled into the Edge Runtime (middleware) which cannot use Node.js
 * native modules.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    // Edge-safe: only reads from the JWT token — no Prisma calls.
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      if (token.phoneNumber) {
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user?.role as string | undefined) ?? "USER";
      const pathname = nextUrl.pathname;

      const isAuthRoute = pathname.startsWith("/api/auth");
      const isLoginPage = pathname === "/login";

      if (isAuthRoute) return true;

      // Plain USERs should never be in the admin app.
      if (isLoggedIn && role === "USER") {
        return Response.redirect(
          new URL("https://bookings.cruxgroup.in", nextUrl)
        );
      }

      // Redirect to correct home if visiting a wrong-role section.
      if (isLoggedIn && role === "ADMIN") {
        const isPartnerRoute = PARTNER_ONLY.some((p) =>
          pathname.startsWith(p)
        );
        if (isPartnerRoute) return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isLoggedIn && role === "PARTNER") {
        if (isPartnerBlockedFromPath(pathname)) {
          return Response.redirect(new URL("/fleet", nextUrl));
        }
      }

      if (isLoggedIn && isLoginPage) {
        const home = role === "PARTNER" ? "/fleet" : "/dashboard";
        return Response.redirect(new URL(home, nextUrl));
      }

      if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  ...enterpriseAuthSecurity,
};
