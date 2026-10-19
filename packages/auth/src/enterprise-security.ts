import type { NextAuthConfig } from "next-auth";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * `Secure` cookies are not stored on plain `http://localhost`, which breaks
 * CSRF + session for client-side `signIn()` and for `cookies().set()` in dev.
 * Production keeps strict transport-aligned cookies.
 */
const isProduction = process.env["NODE_ENV"] === "production";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  secure: isProduction,
};

/**
 * Hardened Auth.js defaults for route handlers and edge `auth()`.
 * Merge with app-specific `providers`, `callbacks`, and `pages`.
 *
 * Signing secret is **not** set here — Auth.js reads `NEXTAUTH_SECRET` / `AUTH_SECRET`
 * when handling a request (`setEnvDefaults`). Startup validation runs in `instrumentation.ts`.
 *
 * - In production: `useSecureCookies: true` and `Secure` session cookies.
 * - `sameSite: "strict"` on session-related cookies to reduce CSRF risk.
 */
export const enterpriseAuthSecurity: Pick<
  NextAuthConfig,
  "useSecureCookies" | "session" | "cookies" | "trustHost"
> = {
  trustHost: true,
  useSecureCookies: isProduction,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 0,
  },
  cookies: {
    sessionToken: {
      options: { ...sessionCookieOptions },
    },
    csrfToken: {
      options: { ...sessionCookieOptions },
    },
    callbackUrl: {
      options: { ...sessionCookieOptions },
    },
  },
};
