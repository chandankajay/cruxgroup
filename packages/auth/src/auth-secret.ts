/** Matches Auth.js `setEnvDefaults` precedence (`AUTH_SECRET` then `NEXTAUTH_SECRET`). */
const AUTH_SECRET_ENV_KEYS = ["AUTH_SECRET", "NEXTAUTH_SECRET"] as const;

const MISSING_AUTH_SECRET_MESSAGE =
  "Set AUTH_SECRET or NEXTAUTH_SECRET (required to sign sessions).";

/**
 * Resolves the Auth.js signing secret at call time (never at module load).
 * Used by instrumentation startup checks and any server code that needs the secret explicitly.
 */
export function getAuthSecret(): string {
  for (const key of AUTH_SECRET_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  throw new Error(MISSING_AUTH_SECRET_MESSAGE);
}

/** Fail closed when the Node.js server boots (see each app's `instrumentation.ts`). */
export function validateAuthSecretAtStartup(): void {
  getAuthSecret();
}
