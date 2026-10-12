export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateAppEnvAtStartup } = await import("@repo/env");
    validateAppEnvAtStartup();
  }
}
