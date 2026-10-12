import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3002";
const useExternalBase = Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());
const localDevSecret = "playwright-local-dev-secret-min-32-chars";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "e2e/results.json" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(useExternalBase
    ? {}
    : {
        webServer: {
          command: "pnpm dev",
          url: `${baseURL}/en/services/request-quote`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            DATABASE_URL:
              process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/crux_playwright",
            AUTH_SECRET: process.env.AUTH_SECRET ?? localDevSecret,
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? localDevSecret,
            CRUX_SERVICES_REVALIDATE_SECRET:
              process.env.CRUX_SERVICES_REVALIDATE_SECRET ?? localDevSecret,
          },
        },
      }),
});
