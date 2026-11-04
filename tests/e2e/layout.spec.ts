import { expect, test } from "@playwright/test";

test.describe("donaciones", () => {
  test("el pie enlaza a Ko-fi en otra pestaña", async ({ page }) => {
    await page.goto("/");
    const link = page.getByTestId("donation-link");
    await expect(link).toHaveAttribute("href", "https://ko-fi.com/alejandroprietodiez");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });
});

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
