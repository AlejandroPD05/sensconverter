import { describe, expect, it } from "vitest";
import {
  cm360For,
  convertSensitivity,
  fovRatio,
  getMethodAvailability,
  sensitivityForCm360,
  sensitivityToSensitivity,
} from "./engine";
import { getGame } from "@/lib/games/registry";

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
      sourceFov: 106.26,
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
});
