import type { NextResponse } from "next/server";
import { shouldNoIndex, type AppEnv } from "./app-env";

function readAppEnv(): AppEnv | undefined {
  const raw = process.env["APP_ENV"]?.trim();
  if (raw === "dev" || raw === "prod" || raw === "ci") {
    return raw;
  }
  return undefined;
}

/** Edge-safe: avoids throwing when APP_ENV is unset during local dev. */
export function shouldNoIndexEdge(): boolean {
  const env = readAppEnv();
  if (!env) {
    return process.env["NODE_ENV"] !== "production";
  }
  return shouldNoIndex(env);
}

export function applyNoIndexHeaders(response: NextResponse): void {
  if (shouldNoIndexEdge()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
}
