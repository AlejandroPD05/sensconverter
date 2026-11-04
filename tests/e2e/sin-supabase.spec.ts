import { expect, test } from "@playwright/test";

// Este archivo corre contra el servidor de Playwright arrancado sin
// credenciales de Supabase (proyecto "sin-supabase", puerto 3101).
test.describe("sin credenciales de Supabase", () => {
  test("la calculadora pública convierte y recalcula", async ({ page }) => {
    await page.goto("/");
    const calculator = page.getByTestId("calculator");

    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.314");
    await calculator.getByLabel("Sensibilidad en el juego", { exact: true }).fill("2");
    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.629");
    await expect(
      calculator.getByRole("link", { name: /Entra para guardar perfiles/i }),
    ).toBeVisible();
  });

  test("la sensibilidad global funciona sin backend", async ({ page }) => {
    await page.goto("/global");
    await page.getByLabel("Objetivo cm/360").fill("30");
    await expect(page.getByTestId("global-sensitivity")).toHaveText("0.544");
    await expect(page.getByText(/Guardado localmente en este navegador/i)).toBeVisible();
  });

  test("la cuenta explica que falta configurar Supabase", async ({ page }) => {
    await page.goto("/account");
    await expect(
      page.getByText(/El registro es opcional y requiere configurar Supabase/i),
    ).toBeVisible();
  });
});
