import { describe, expect, it } from "vitest";
import {
  cm360For,
  convertSensitivity,
  fovRatio,
  getMethodAvailability,
  sensitivityForCm360,
  sensitivityToSensitivity,
} from "./engine";
import { games, getGame } from "@/lib/games/registry";
import { actualFov } from "./fov";
import { zoomRecommendations } from "./zoom";

describe("cm/360", () => {
  it("calcula el ejemplo documentado de Valorant (0.4 a 800 DPI)", () => {
    const valorant = getGame("valorant");
    expect(valorant?.yaw).toBe(0.07);
    // 914.4 / (800 × 0.4 × 0.07) = 40.8214...; las fuentes lo redondean a 40.8.
    expect(cm360For(800, 0.4, 0.07)).toBeCloseTo(40.8214, 4);
  });

  it("calcula CS2 con su constante yaw de 0.022", () => {
    expect(cm360For(800, 1, 0.022)).toBeCloseTo(51.9545, 3);
  });

  it("es inversa de sí misma dentro de una tolerancia numérica", () => {
    const cm360 = cm360For(1600, 0.35, 0.07);
    const sens = sensitivityForCm360(1600, cm360, 0.07);
    expect(sens).toBeCloseTo(0.35, 12);
  });

  it("mantiene el cm/360 al duplicar DPI y dividir sensibilidad", () => {
    const at800 = cm360For(800, 2, 0.022);
    const at1600 = cm360For(1600, 1, 0.022);
    expect(at1600).toBeCloseTo(at800, 12);
  });
});

describe("conversión entre juegos", () => {
  it("CS2 1.0 a 800 DPI equivale a Valorant 0.3142857", () => {
    const value = sensitivityToSensitivity(1, 0.022, 0.07, 800, 800);
    expect(value).toBeCloseTo(0.3142857, 6);
  });

  it("convierte CS2 a Valorant conservando cm/360", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "cm360",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.targetCm360).toBeCloseTo(result.sourceCm360, 10);
    expect(result.targetSensitivity).toBeCloseTo(0.3142857, 6);
  });

  it("es reversible en el caso 360°", () => {
    const there = convertSensitivity({
      sourceGameId: "apex-legends",
      targetGameId: "overwatch-2",
      sourceSensitivity: 1.2,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(there.ok).toBe(true);
    if (!there.ok) return;

    const back = convertSensitivity({
      sourceGameId: "overwatch-2",
      targetGameId: "apex-legends",
      sourceSensitivity: there.targetSensitivity,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.targetSensitivity).toBeCloseTo(1.2, 10);
  });

  it("ajusta la sensibilidad objetivo al cambiar el DPI de destino", () => {
    const base = {
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "cm360" as const,
    };
    const at800 = convertSensitivity(base);
    const at1600 = convertSensitivity({ ...base, targetDpi: 1600 });
    expect(at800.ok && at1600.ok).toBe(true);
    if (!at800.ok || !at1600.ok) return;
    expect(at1600.targetSensitivity).toBeCloseTo(at800.targetSensitivity / 2, 10);
    expect(at1600.targetCm360).toBeCloseTo(at800.targetCm360, 10);
  });

  it("redondea solo el valor mostrable según la precisión del juego", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.targetSensitivityRounded).toBe(0.314);
    expect(result.targetSensitivity).not.toBe(result.targetSensitivityRounded);
  });
});

describe("validación", () => {
  it("rechaza sensibilidad cero o negativa", () => {
    for (const sens of [0, -1]) {
      const result = convertSensitivity({
        sourceGameId: "cs2",
        targetGameId: "valorant",
        sourceSensitivity: sens,
        sourceDpi: 800,
        method: "cm360",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.field).toBe("sourceSensitivity");
    }
  });

  it("rechaza NaN e Infinity", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = convertSensitivity({
        sourceGameId: "cs2",
        targetGameId: "valorant",
        sourceSensitivity: value,
        sourceDpi: 800,
        method: "cm360",
      });
      expect(result.ok).toBe(false);
    }
  });

  it("rechaza DPI fuera de rango", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 0,
      method: "cm360",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("sourceDpi");
  });

  it("rechaza juegos con fórmula pendiente", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "pubg",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("unsupported_game");
  });

  it("rechaza juegos inexistentes", () => {
    const result = convertSensitivity({
      sourceGameId: "no-existe",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("unknown_game");
  });
});

describe("métodos de conversión", () => {
  it("desactiva game-specific sin fórmula verificada", () => {
    const source = getGame("cs2");
    const target = getGame("valorant");
    expect(source && target).toBeTruthy();
    if (!source || !target) return;
    const method = getMethodAvailability(source, target).find(
      (item) => item.method.id === "game-specific",
    );
    expect(method?.available).toBe(false);
    expect(method?.reason).toBeTruthy();
  });

  it("usa el ratio tangencial en 0% de distancia de monitor", () => {
    const expected =
      Math.tan((103 * Math.PI) / 360) / Math.tan((106.26 * Math.PI) / 360);
    expect(fovRatio(106.26, 103, 0)).toBeCloseTo(expected, 10);
  });

  it("en 100% equivale al ratio lineal de FOV", () => {
    expect(fovRatio(106.26, 103, 1)).toBeCloseTo(103 / 106.26, 10);
  });

  it("FOV aware cambia el resultado respecto a 360°", () => {
    const common = {
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
    };
    const plain = convertSensitivity({ ...common, method: "cm360" });
    const fov = convertSensitivity({
      ...common,
      method: "fov-aware",
      sourceFov: 90,
      targetFov: 103,
    });
    expect(plain.ok && fov.ok).toBe(true);
    if (!plain.ok || !fov.ok) return;
    expect(fov.targetSensitivity).toBeLessThan(plain.targetSensitivity);
    expect(fov.targetCm360).not.toBeCloseTo(plain.targetCm360, 2);
  });

  it("monitor-distance al 50% queda entre el caso tangencial y el lineal", () => {
    const tangent = fovRatio(106.26, 103, 0);
    const middle = fovRatio(106.26, 103, 0.5);
    const linear = fovRatio(106.26, 103, 1);
    expect(middle).toBeGreaterThan(tangent);
    expect(middle).toBeLessThan(linear);
  });

  it("rechaza FOV inválido", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "fov-aware",
      sourceFov: 0,
      targetFov: 103,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("fov");
  });

  it("advierte cuando el resultado queda fuera del rango del juego", () => {
    const result = convertSensitivity({
      sourceGameId: "valorant",
      targetGameId: "cs2",
      sourceSensitivity: 10,
      sourceDpi: 32000,
      method: "cm360",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.some((warning) => warning.includes("supera"))).toBe(true);
  });

  it("advierte de juegos experimentales", () => {
    const result = convertSensitivity({
      sourceGameId: "r6-siege",
      targetGameId: "cs2",
      sourceSensitivity: 6,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.some((warning) => warning.includes("experimental"))).toBe(
      true,
    );
  });

  it("acepta el rango 1–100 del slider de Siege y su ejemplo publicado", () => {
    // Ejemplo comunitario: 800 DPI, sensibilidad 10, yaw 0.00572957795 → ~19.9 cm/360.
    expect(cm360For(800, 10, 0.00572958)).toBeCloseTo(19.95, 1);
    const atDefault = convertSensitivity({
      sourceGameId: "r6-siege",
      targetGameId: "cs2",
      sourceSensitivity: 50,
      sourceDpi: 800,
      method: "cm360",
    });
    expect(atDefault.ok).toBe(true);
  });
});

describe("capacidades declaradas", () => {
  it("las capacidades coinciden con los datos de FOV y zoom", () => {
    // La biblioteca muestra cada capacidad como badge: declarar una que el motor
    // no implementa sería una compatibilidad falsa.
    for (const game of games) {
      expect(game.capabilities, `${game.id} declara ads`).not.toContain("ads");
      // "scoped" solo con un modelo de zoom declarado.
      expect(game.capabilities.includes("scoped"), `${game.id} y scoped`).toBe(
        Boolean(game.zoom),
      );
      // Los métodos con FOV solo si el juego declara cómo lo mide.
      expect(game.capabilities.includes("fovAware"), `${game.id} y fovAware`).toBe(
        Boolean(game.fov),
      );
    }
  });
});

describe("FOV real y relación de aspecto", () => {
  it("90 horizontal 4:3 equivale a 106.26° en 16:9 y 73.74° vertical", () => {
    const fov = actualFov(90, "hdeg-4:3", 16 / 9);
    expect(fov.horizontal).toBeCloseTo(106.26, 2);
    expect(fov.vertical).toBeCloseTo(73.74, 2);
  });

  it("103 horizontal 16:9 da 70.53° vertical en cualquier monitor (Hor+)", () => {
    expect(actualFov(103, "hdeg-16:9", 16 / 9).vertical).toBeCloseTo(70.53, 2);
    expect(actualFov(103, "hdeg-16:9", 4 / 3).vertical).toBeCloseTo(70.53, 2);
    expect(actualFov(103, "hdeg-16:9", 4 / 3).horizontal).toBeLessThan(103);
  });

  it("un FOV vertical se mantiene y el horizontal crece con el aspecto", () => {
    const wide = actualFov(60, "vdeg", 21 / 9);
    const normal = actualFov(60, "vdeg", 16 / 9);
    expect(wide.vertical).toBeCloseTo(60, 10);
    expect(wide.horizontal).toBeGreaterThan(normal.horizontal);
  });

  it("CS2 → VALORANT con focal length usa los FOV reales, no los valores de menú", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "fov-aware",
      sourceFov: 90,
      targetFov: 103,
      aspectRatio: 16 / 9,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expected =
      (1 * 0.022 / 0.07) *
      (Math.tan((103 * Math.PI) / 360) / Math.tan((106.2602 * Math.PI) / 360));
    expect(result.targetSensitivity).toBeCloseTo(expected, 4);
    expect(result.sourceActualFov?.horizontal).toBeCloseTo(106.26, 2);
  });

  it("la distancia de monitor vertical al 100% compara los FOV verticales", () => {
    const common = {
      sourceGameId: "apex-legends",
      targetGameId: "r6-siege",
      sourceSensitivity: 2,
      sourceDpi: 800,
      method: "monitor-distance" as const,
      sourceFov: 90,
      targetFov: 60,
      monitorDistance: 1,
      aspectRatio: 16 / 9,
    };
    const vertical = convertSensitivity({ ...common, monitorAxis: "vertical" });
    const horizontal = convertSensitivity({ ...common, monitorAxis: "horizontal" });
    expect(vertical.ok && horizontal.ok).toBe(true);
    if (!vertical.ok || !horizontal.ok) return;
    expect(vertical.fovRatio).toBeCloseTo(60 / 73.7398, 4);
    expect(vertical.targetSensitivity).not.toBeCloseTo(horizontal.targetSensitivity, 4);
  });

  it("Viewspeed no está disponible y Fortnite no ofrece métodos con FOV", () => {
    const cs2 = getGame("cs2")!;
    const fortnite = getGame("fortnite")!;
    const viewspeed = getMethodAvailability(cs2, getGame("valorant")!).find(
      (item) => item.method.id === "viewspeed",
    );
    expect(viewspeed?.available).toBe(false);
    const focal = getMethodAvailability(cs2, fortnite).find(
      (item) => item.method.id === "fov-aware",
    );
    expect(focal?.available).toBe(false);
    expect(focal?.reason).toMatch(/Fortnite/);
  });
});

describe("miras (modelo lineal de Source)", () => {
  it("la AWP a 0% da el conocido zoom_sensitivity_ratio 0.818933", () => {
    const awp = zoomRecommendations({
      game: getGame("cs2")!,
      hipFov: 90,
      aspectRatio: 16 / 9,
      match: "monitor",
      monitorDistance: 0,
      monitorAxis: "horizontal",
    });
    expect(awp?.[0].setting).toBeCloseTo(0.818933, 5);
  });

  it("igualar la distancia 360° con el rifle de TF2 deshace el escalado lineal", () => {
    const sniper = zoomRecommendations({
      game: getGame("tf2")!,
      hipFov: 90,
      aspectRatio: 16 / 9,
      match: "cm360",
      monitorDistance: 0,
      monitorAxis: "horizontal",
    });
    expect(sniper?.[0].setting).toBeCloseTo(90 / 20, 10);
  });

  it("sin modelo verificado no devuelve ningún valor", () => {
    expect(
      zoomRecommendations({
        game: getGame("valorant")!,
        hipFov: 103,
        aspectRatio: 16 / 9,
        match: "monitor",
        monitorDistance: 0,
        monitorAxis: "horizontal",
      }),
    ).toBeNull();
  });
});

describe("resolución distinta en origen y destino", () => {
  it("cada lado usa su propia relación de aspecto", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "fov-aware",
      sourceFov: 90,
      targetFov: 103,
      sourceAspectRatio: 16 / 9,
      targetAspectRatio: 4 / 3,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sourceActualFov?.horizontal).toBeCloseTo(106.26, 2);
    // VALORANT mantiene 70.53° verticales: en 4:3 ve menos a los lados.
    expect(result.targetActualFov?.vertical).toBeCloseTo(70.53, 2);
    expect(result.targetActualFov?.horizontal).toBeLessThan(103);
  });

  it("rechaza una resolución no válida en los métodos con FOV", () => {
    const result = convertSensitivity({
      sourceGameId: "cs2",
      targetGameId: "valorant",
      sourceSensitivity: 1,
      sourceDpi: 800,
      method: "fov-aware",
      sourceFov: 90,
      targetFov: 103,
      targetAspectRatio: Number.NaN,
    });
    expect(result.ok).toBe(false);
  });
});
