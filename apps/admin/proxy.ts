import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 uses proxy.ts instead of middleware.ts.
 * This uses the lightweight Edge-safe authConfig (no Prisma imports).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
