import { expect, test } from "@playwright/test";

test.describe("cabeceras de seguridad", () => {
  test("todas las páginas impiden el iframe y fijan la CSP", async ({ request }) => {
    for (const path of ["/", "/login", "/games"]) {
      const response = await request.get(path);
      const headers = response.headers();
      expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
      expect(headers["content-security-policy"], path).toContain("object-src 'none'");
      expect(headers["x-frame-options"], path).toBe("DENY");
      expect(headers["x-content-type-options"], path).toBe("nosniff");
      expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
      expect(headers["x-powered-by"], path).toBeUndefined();
    }
  });

  test("el callback de acceso no redirige fuera del sitio", async ({ request }) => {
    const response = await request.get("/auth/callback?next=//evil.example&code=x", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    const location = new URL(response.headers().location);
    expect(["localhost", "127.0.0.1"]).toContain(location.hostname);
    expect(location.pathname).toBe("/login");
  });
});

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
