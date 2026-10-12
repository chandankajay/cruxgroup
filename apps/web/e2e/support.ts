import { test } from "@playwright/test";

/** Skip the suite when the quote page cannot render (no Mongo / preview down). */
export function skipUnlessQuotePageHealthy(): void {
  test.beforeAll(async ({ request, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3002";
    const res = await request.get(`${origin}/en/services/request-quote`, {
      failOnStatusCode: false,
    });
    if (res.status() >= 500) {
      test.skip(
        true,
        `Quote page returned ${res.status()}. Set PLAYWRIGHT_BASE_URL to the #25 Vercel preview (with DATABASE_URL) or run a local dev server with MongoDB.`,
      );
    }
  });
}
