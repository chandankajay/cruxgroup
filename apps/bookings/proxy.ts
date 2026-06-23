import NextAuth, { type NextAuthResult } from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth: NextAuthResult = NextAuth(authConfig);

const auth: NextAuthResult["auth"] = nextAuth.auth;
export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|loginbg\\.jpg|.*\\.(?:ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$).*)",
  ],
};
