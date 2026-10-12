import { parseAppEnv } from "./app-env";
import { validateRazorpayEnvAtStartup } from "./razorpay-env";

/** Node startup validation (instrumentation.ts). Fails fast on misconfigured deploy env. */
export function validateAppEnvAtStartup(): void {
  parseAppEnv(process.env["APP_ENV"]);
  validateRazorpayEnvAtStartup();
}
