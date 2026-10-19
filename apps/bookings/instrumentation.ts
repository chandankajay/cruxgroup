export async function register(): Promise<void> {
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    const { validateAuthSecretAtStartup } = await import("@repo/auth");
    validateAuthSecretAtStartup();
  }
}
