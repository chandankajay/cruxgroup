import type { NextAuthConfig } from "next-auth";

const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;

function resolveAuthSecret(): string {
  const fromEnv =
    process.env["NEXTAUTH_SECRET"] ?? process.env["AUTH_SECRET"] ?? "";
  if (fromEnv) return fromEnv;
  if (process.env["NODE_ENV"] === "production") {
    throw new Error(
      "Set NEXTAUTH_SECRET or AUTH_SECRET in production (required to sign sessions).",
    );
  }
  // Dev fallback so JWT encode never throws with 500 — replace in .env for real work.
  return "dev-only-insecure-secret-change-in-env";
}

/**
 * `Secure` cookies are not stored on plain `http://localhost`, which breaks
 * CSRF + session for client-side `signIn()` and for `cookies().set()` in dev.
 * Production keeps strict transport-aligned cookies.
 */
const isProduction = process.env["NODE_ENV"] === "production";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: isProduction,
};

/**
 * Hardened Auth.js defaults for route handlers and edge `auth()`.
 * Merge with app-specific `providers`, `callbacks`, and `pages`.
 *
 * - `NEXTAUTH_SECRET` is the canonical signing key; `AUTH_SECRET` is accepted for compatibility.
 * - In production: `useSecureCookies: true` and `Secure` session cookies.
 */
export const enterpriseAuthSecurity: Pick<
  NextAuthConfig,
  "secret" | "useSecureCookies" | "session" | "cookies" | "trustHost"
> = {
  secret: resolveAuthSecret(),
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
