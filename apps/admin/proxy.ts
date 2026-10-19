import { applyNoIndexHeaders } from "@repo/env/edge";
import NextAuth, { type NextAuthResult } from "next-auth";
import type { NextMiddleware } from "next/server";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const nextAuth: NextAuthResult = NextAuth(authConfig);
const auth: NextAuthResult["auth"] = nextAuth.auth;

const withNoIndex: NextMiddleware = () => {
  const response = NextResponse.next();
  applyNoIndexHeaders(response);
  return response;
};

export default auth(withNoIndex as Parameters<typeof auth>[0]) as NextMiddleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|loginbg\\.jpg|.*\\.(?:ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$).*)",
  ],
};
