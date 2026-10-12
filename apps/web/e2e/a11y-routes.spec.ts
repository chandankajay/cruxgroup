import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { skipUnlessQuotePageHealthy } from "./support";

skipUnlessQuotePageHealthy();

test.describe("services routes a11y", () => {
  test("request-quote form has no serious axe violations", async ({ page }) => {
    await page.goto("/en/services/request-quote");
    const results = await new AxeBuilder({ page }).include("form").analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });

  test("projects hub main content has no serious axe violations", async ({ page }) => {
    await page.goto("/en/projects");
    const results = await new AxeBuilder({ page }).include("main").analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});
