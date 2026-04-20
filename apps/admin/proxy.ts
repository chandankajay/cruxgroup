import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 uses proxy.ts instead of middleware.ts.
 * This uses the lightweight Edge-safe authConfig (no Prisma imports).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Bookings has no middleware; Admin must skip static public files or `authorized` redirects
    // unauthenticated /logo.png → /login (HTML) and the login page image breaks.
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|loginbg\\.jpg|.*\\.(?:ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$).*)",
  ],
};
