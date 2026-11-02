import { expect, test } from "@playwright/test";

test.describe("maquetación", () => {
  test("la biblioteca y el acceso no desbordan horizontalmente", async ({ page }) => {
    for (const route of ["/games", "/login"]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${route} no debe desbordar`).toBe(false);
    }
  });
});
