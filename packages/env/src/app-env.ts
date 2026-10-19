import { z } from "zod";

/**
 * Deployment tier — set explicitly via `APP_ENV` on Vercel (Preview = dev, Production = prod).
 * Do not infer from VERCEL_ENV; dev deploys use Vercel **Preview** only (no custom Vercel environments).
 */
export const appEnvSchema = z.enum(["dev", "prod", "ci"]);

export type AppEnv = z.infer<typeof appEnvSchema>;

function isOnVercel(): boolean {
  return process.env["VERCEL"] === "1";
}

export function parseAppEnv(raw: string | undefined): AppEnv {
  const value = raw?.trim();
  const onVercel = isOnVercel();

  if (!value) {
    if (onVercel) {
      throw new Error(
        "APP_ENV must be set on Vercel (dev | prod | ci); missing APP_ENV is not allowed",
      );
    }
    if (process.env["NODE_ENV"] === "test" || process.env["CI"] === "true") {
      return "ci";
    }
    if (process.env["NODE_ENV"] === "production") {
      return "prod";
    }
    return "dev";
  }

  const parsed = appEnvSchema.safeParse(value);
  if (!parsed.success) {
    if (onVercel) {
      throw new Error(
        `APP_ENV must be dev, prod, or ci on Vercel (got: ${value})`,
      );
    }
    throw parsed.error;
  }
  return parsed.data;
}

export function getAppEnv(): AppEnv {
  return parseAppEnv(process.env["APP_ENV"]);
}

export function isProductionAppEnv(env: AppEnv = getAppEnv()): boolean {
  return env === "prod";
}

export function shouldNoIndex(env: AppEnv = getAppEnv()): boolean {
  return env !== "prod";
}
