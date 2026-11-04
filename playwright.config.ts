import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// Las pruebas autenticadas leen TEST_USER_* y las claves públicas de .env.local.
// En CI las variables llegan por el entorno y el archivo no existe.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

// Se ejecuta contra un segundo servidor sin credenciales de Supabase.
const NO_BACKEND_SPEC = /sin-supabase\.spec\.ts$/;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Las pruebas autenticadas comparten un único usuario de prueba y crean/editan
  // perfiles. Con un solo worker evitamos que escritorio y móvil se pisen.
  workers: process.env.TEST_USER_EMAIL ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run dev -- --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // Mismo código sin credenciales de Supabase: valores no válidos para que
      // Next no rellene las variables desde .env.local.
      command: "npm run dev -- --port 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        NEXT_DIST_DIR: ".next-e2e-sin-supabase",
        NEXT_PUBLIC_SUPABASE_URL: "sin-configurar",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "sin-configurar",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      testIgnore: NO_BACKEND_SPEC,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testIgnore: NO_BACKEND_SPEC,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "sin-supabase",
      testMatch: NO_BACKEND_SPEC,
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3101" },
    },
  ],
});
