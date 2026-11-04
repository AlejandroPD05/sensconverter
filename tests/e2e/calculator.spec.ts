import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("calculadora anónima", () => {
  test("convierte CS2 a VALORANT sin cuenta", async ({ page }) => {
    await page.goto("/");
    const calculator = page.getByTestId("calculator");

    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.314");
    await expect(calculator.getByText(/cm\/360 destino/i)).toBeVisible();
    await expect(calculator.getByRole("link", { name: /Entra para guardar perfiles/i })).toBeVisible();
  });

  test("actualiza el resultado al cambiar la sensibilidad", async ({ page }) => {
    await page.goto("/");
    const calculator = page.getByTestId("calculator");
    const sensitivity = calculator.getByLabel("Sensibilidad en el juego", {
      exact: true,
    });

    await sensitivity.fill("2");
    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.629");
  });

  test("el mismo DPI en origen y destino conserva la equivalencia", async ({ page }) => {
    await page.goto("/");
    const calculator = page.getByTestId("calculator");
    const dpi = calculator.getByLabel("DPI del ratón", { exact: true });

    await dpi.fill("1600");
    await expect(calculator.getByText("25.98 cm")).toHaveCount(2);
    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.314");
  });

  test("cambia el juego de origen y conserva la conversión", async ({ page }) => {
    await page.goto("/");
    const calculator = page.getByTestId("calculator");

    await calculator
      .getByRole("button", { name: "Juego de origen", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: /Buscar juego de origen/i })
      .fill("Apex");
    await page.getByRole("option", { name: /Apex Legends/i }).click();

    await expect(calculator.getByTestId("target-sensitivity")).toHaveText("0.314");
  });

  test("configura la sensibilidad global sin registro", async ({ page }) => {
    await page.goto("/global");
    const target = page.getByTestId("global-sensitivity");

    await page.getByLabel("Objetivo cm/360").fill("30");
    await expect(target).toHaveText("0.544");
    await expect(page.getByText(/Guardado localmente en este navegador/i)).toBeVisible();
  });

  test("los juegos pendientes explican por qué no hay conversión", async ({ page }) => {
    await page.goto("/games");
    await page.getByRole("button", { name: "Pendientes" }).click();

    await expect(page.getByRole("heading", { name: "PUBG: Battlegrounds" })).toBeVisible();
    await expect(page.getByText("Sin verificar").first()).toBeVisible();

    await page.getByRole("link", { name: /Por qué no está disponible/i }).first().click();
    await expect(page).toHaveURL(/#limites$/);
    await expect(page.getByRole("heading", { name: /Lo que esta herramienta no hace/i })).toBeVisible();
  });

  test("la navegación inferior solo aparece en móvil y no desborda", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByTestId("target-sensitivity")).toBeVisible();

    const bottomNav = page.getByRole("navigation", { name: "Navegación inferior" });
    if (testInfo.project.name === "mobile") {
      await expect(bottomNav).toBeVisible();
    } else {
      await expect(bottomNav).toBeHidden();
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test.describe("cuenta y persistencia", () => {
  test.skip(
    !email || !password,
    "Define TEST_USER_EMAIL y TEST_USER_PASSWORD (y Supabase configurado) para ejecutar las pruebas autenticadas.",
  );

  test("guarda, recarga, edita y elimina un perfil", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(email!);
    await page.getByLabel("Contraseña", { exact: true }).fill(password!);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/");

    const calculator = page.getByTestId("calculator");
    await calculator.getByRole("button", { name: /Guardar en mi cuenta/i }).click();
    await expect(page.getByText(/Perfil guardado/i)).toBeVisible();

    await page.goto("/my-sensitivities");
    await expect(
      page.getByRole("heading", { name: /CS2 → VALORANT/i }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: /CS2 → VALORANT/i }).first(),
    ).toBeVisible();

    await page.goto("/account");
    await expect(
      page.getByRole("heading", { name: "Configuraciones recientes" }),
    ).toBeVisible();
    await expect(page.getByTestId("recent-profiles")).toContainText(/CS2 → VALORANT/i);
    await expect(page.getByRole("heading", { name: "Juegos favoritos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Eliminar mi cuenta" })).toBeVisible();

    await page.goto("/my-sensitivities");
    await page.getByRole("button", { name: "Editar" }).first().click();
    await page.getByLabel("Nombre").fill("Perfil E2E");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(
      page.getByRole("heading", { name: "Perfil E2E" }).first(),
    ).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Eliminar" }).first().click();
    await expect(page.getByText(/Perfil eliminado/i)).toBeVisible();
  });
});

test.describe("aislamiento de datos", () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Necesita las variables públicas de Supabase para comprobar el acceso anónimo a la API.",
  );

  test("la API anónima no puede leer perfiles", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const response = await request.get(
      `${url}/rest/v1/sensitivity_profiles?select=id`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("aislamiento entre usuarios (RLS)", () => {
  test.skip(
    !email ||
      !password ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Necesita Supabase y TEST_USER_EMAIL / TEST_USER_PASSWORD.",
  );

  // Con un solo usuario de prueba se comprueban las políticas desde su lado:
  // RLS evalúa WITH CHECK antes que las claves foráneas, así que escribir en
  // nombre de otro id devuelve 42501 (violación de política) y no 23503.
  const otherUserId = "00000000-0000-4000-8000-000000000001";
  const RLS_VIOLATION = "42501";

  async function signedInClient() {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await client.auth.signInWithPassword({
      email: email!,
      password: password!,
    });
    expect(error).toBeNull();
    return { client, userId: data.user!.id };
  }

  test("solo lee sus propios perfiles", async () => {
    const { client, userId } = await signedInClient();
    const { data, error } = await client.from("sensitivity_profiles").select("user_id");
    expect(error).toBeNull();
    for (const row of data ?? []) expect(row.user_id).toBe(userId);

    const others = await client
      .from("sensitivity_profiles")
      .select("id")
      .neq("user_id", userId);
    expect(others.error).toBeNull();
    expect(others.data).toEqual([]);
    await client.auth.signOut();
  });

  test("no puede crear perfiles ni preferencias a nombre de otro usuario", async () => {
    const { client } = await signedInClient();

    const profile = await client.from("sensitivity_profiles").insert({
      user_id: otherUserId,
      name: "Intrusión RLS",
      game_id: "cs2",
      dpi: 800,
      sensitivity: 1,
      method: "cm360",
    });
    expect(profile.error?.code).toBe(RLS_VIOLATION);

    const preferences = await client
      .from("profiles")
      .insert({ id: otherUserId, display_name: "Intrusión RLS" });
    expect(preferences.error?.code).toBe(RLS_VIOLATION);
    await client.auth.signOut();
  });

  test("no puede traspasar un perfil propio a otro usuario", async () => {
    const { client, userId } = await signedInClient();
    const created = await client
      .from("sensitivity_profiles")
      .insert({
        user_id: userId,
        name: "RLS traspaso E2E",
        game_id: "cs2",
        dpi: 800,
        sensitivity: 1,
        method: "cm360",
      })
      .select("id")
      .single();
    expect(created.error).toBeNull();
    const id = created.data!.id as string;

    try {
      const moved = await client
        .from("sensitivity_profiles")
        .update({ user_id: otherUserId })
        .eq("id", id);
      expect(moved.error?.code).toBe(RLS_VIOLATION);
    } finally {
      await client.from("sensitivity_profiles").delete().eq("id", id);
      await client.auth.signOut();
    }
  });

  test("la clave anónima no puede ejecutar el borrado de cuenta", async () => {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const { error } = await anon.rpc("delete_own_account");
    test.skip(
      error?.code === "PGRST202",
      "La migración 0003_delete_own_account.sql no está aplicada en este proyecto.",
    );
    expect(error).not.toBeNull();
  });
});
