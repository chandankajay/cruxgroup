import { getAppEnv, isProductionAppEnv } from "./app-env";

/**
 * Validates Razorpay keys against APP_ENV. Call once from instrumentation at startup.
 */
export function validateRazorpayEnvAtStartup(): void {
  const keyId = process.env["RAZORPAY_KEY_ID"]?.trim();
  if (!keyId) return;

  const isLiveKey = keyId.startsWith("rzp_live_");
  const isTestKey = keyId.startsWith("rzp_test_");

  if (isProductionAppEnv()) {
    if (!isLiveKey) {
      throw new Error(
        "RAZORPAY_KEY_ID must be a live key (rzp_live_*) when APP_ENV=prod.",
      );
    }
    return;
  }

  if (isLiveKey) {
    throw new Error(
      `Live Razorpay keys are not allowed when APP_ENV=${getAppEnv()}. Use rzp_test_* keys.`,
    );
  }

  if (!isTestKey && process.env["NODE_ENV"] === "production") {
    throw new Error(
      "RAZORPAY_KEY_ID must be a test key (rzp_test_*) outside prod.",
    );
  }
}
