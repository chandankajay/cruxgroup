export async function register(): Promise<void> {
  // eslint-disable-next-line turbo/no-undeclared-env-vars -- Next.js sets NEXT_RUNTIME; not a Turbo task input
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    const { validateAuthSecretAtStartup } = await import("@repo/auth");
    validateAuthSecretAtStartup();
  }
}
