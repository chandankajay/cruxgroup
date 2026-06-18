import type { NextAuthConfig } from "next-auth";
import { enterpriseAuthSecurity } from "@repo/auth";
import {
  isBookingResponseApi,
  isBookingResponseMagicLink,
  safeCallbackPath,
} from "./lib/booking-response-routes";
import {
  CHOOSE_ROLE_PATH,
  homePathForRole,
  isChooseRolePath,
  isSalesPath,
  needsAdminRoleSelection,
} from "./lib/role-routes";

const PARTNER_ONLY = ["/fleet", "/my-bookings", "/service-area", "/earnings"];

function isPartnerBlockedFromPath(pathname: string): boolean {
  if (pathname.startsWith("/platform-admin")) return true;
  /** Partner walk-in desk lives under `/bookings/new`; admin global list is `/bookings` only. */
  if (
    pathname.startsWith("/bookings") &&
    pathname !== "/bookings/new" &&
    !pathname.startsWith("/bookings/new/")
  ) {
    return true;
  }
  if (["/equipment", "/catalog", "/partners"].some((p) => pathname.startsWith(p))) {
    return true;
  }
  if (pathname.startsWith("/settings") && !pathname.startsWith("/settings/kyc")) {
    return true;
  }
  if (pathname.startsWith("/website-cms")) {
    return true;
  }
  if (pathname.startsWith("/sales-overview")) {
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

      // Public legal documents (readable without a session).
      if (!isLoggedIn && pathname.startsWith("/legal")) return true;

      // Public booking response magic links — token is the credential.
      if (isBookingResponseMagicLink(pathname)) return true;
      if (isBookingResponseApi(pathname)) return true;

      // Phone OTP users pick Partner vs Sales once before entering the app.
      if (isLoggedIn && needsAdminRoleSelection(role)) {
        if (!isChooseRolePath(pathname)) {
          return Response.redirect(new URL(CHOOSE_ROLE_PATH, nextUrl));
        }
        return true;
      }

      // Redirect to correct home if visiting a wrong-role section.
      if (isLoggedIn && role === "ADMIN") {
        const isPartnerRoute = PARTNER_ONLY.some((p) =>
          pathname.startsWith(p)
        );
        if (isPartnerRoute) return Response.redirect(new URL("/dashboard", nextUrl));
        if (isSalesPath(pathname)) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      if (isLoggedIn && role === "SALES") {
        if (!isSalesPath(pathname) && !isChooseRolePath(pathname)) {
          return Response.redirect(new URL(homePathForRole(role), nextUrl));
        }
      }

      if (isLoggedIn && role === "PARTNER") {
        if (isSalesPath(pathname)) {
          return Response.redirect(new URL("/fleet", nextUrl));
        }
        if (isPartnerBlockedFromPath(pathname)) {
          return Response.redirect(new URL("/fleet", nextUrl));
        }
      }

      if (isLoggedIn && isLoginPage) {
        const callback = safeCallbackPath(nextUrl.searchParams.get("callbackUrl"));
        if (callback && !needsAdminRoleSelection(role)) {
          return Response.redirect(new URL(callback, nextUrl));
        }
        return Response.redirect(new URL(homePathForRole(role), nextUrl));
      }

      if (!isLoggedIn && !isLoginPage) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set(
          "callbackUrl",
          pathname + nextUrl.search,
        );
        return Response.redirect(loginUrl);
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
