import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth config.
 * Must NOT import anything from @repo/db or @prisma/client — this file
 * is bundled into the Edge Runtime (middleware) which cannot use Node.js
 * native modules.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
  session: {
    strategy: "database",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isLoginPage = nextUrl.pathname === "/login";

      if (isAuthRoute) return true;
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/", nextUrl));
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
};
