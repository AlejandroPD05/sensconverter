import { expect, test } from "@playwright/test";

test.describe("páginas de acceso", () => {
  test("explica por qué falló el enlace de acceso", async ({ page }) => {
    await page.goto("/login?error=auth_callback");
    await expect(page.getByRole("alert")).toContainText(
      /No se pudo completar el enlace/i,
    );
  });
});
