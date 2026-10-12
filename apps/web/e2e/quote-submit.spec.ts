import { test, expect } from "@playwright/test";
import { skipUnlessQuotePageHealthy } from "./support";

skipUnlessQuotePageHealthy();

test.describe("service quote form", () => {
  test("submits a valid quote request", async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_BASE_URL?.trim(),
      "Set PLAYWRIGHT_BASE_URL to the cruxgroup-web Vercel preview (requires deployed DATABASE_URL).",
    );

    await page.goto("/en/services/request-quote");
    await page.waitForLoadState("domcontentloaded");

    const villageSelect = page.getByLabel(/area or village/i);
    await expect(villageSelect).toBeVisible();
    const firstVillageValue = await villageSelect
      .locator("option")
      .nth(1)
      .getAttribute("value");
    expect(firstVillageValue).toBeTruthy();
    await villageSelect.selectOption(firstVillageValue!);

    await page.getByLabel(/land size/i).fill("2 acres");
    await page.getByLabel(/your name/i).fill("E2E Tester");
    await page.getByLabel(/^phone/i).fill("9848012345");

    await page.getByRole("button", { name: /request site visit/i }).click();

    await expect(page.getByRole("status")).toContainText(/request received/i, {
      timeout: 30_000,
    });
  });
});
