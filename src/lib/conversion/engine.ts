import { getGame } from "@/lib/games/registry";
import {
  isConvertible,
  type GameDefinition,
} from "@/lib/games/types";
import {
  actualFov,
  DEFAULT_ASPECT_RATIO,
  monitorDistanceRatio,
  type ActualFov,
  type MonitorAxis,
} from "./fov";

export const CM_PER_INCH = 2.54;
export const DEGREES_PER_TURN = 360;

export type ConversionMethodId =
  | "cm360"
  | "fov-aware"
  | "monitor-distance"
  | "viewspeed"
  | "game-specific";

export interface ConversionMethod {
  id: ConversionMethodId;
  name: string;
  shortDescription: string;
  preserves: string;
  doesNotPreserve: string;
  requiresFov: boolean;
}

export const conversionMethods: ConversionMethod[] = [
  {
    id: "cm360",
    name: "Distancia 360°",
    shortDescription:
      "Mantiene los centímetros de movimiento físico necesarios para girar 360°.",
    preserves: "La distancia física de un giro completo.",
    doesNotPreserve:
      "La sensación visual: el FOV y los multiplicadores de mira pueden cambiar la percepción.",
    requiresFov: false,
  },
  {
    id: "fov-aware",
    name: "Focal length (0%)",
    shortDescription:
      "Conserva la velocidad aparente en el centro de la pantalla: distancia de monitor al 0%.",
    preserves:
      "El movimiento necesario para pequeños ajustes alrededor de la mira (0% de distancia de monitor).",
    doesNotPreserve:
      "La distancia de un giro de 360°, que cambiará respecto al juego de origen.",
    requiresFov: true,
  },
  {
    id: "monitor-distance",
    name: "Distancia de monitor",
    shortDescription:
      "Coincide el movimiento hasta un porcentaje del ancho (horizontal) o del alto (vertical) de la pantalla.",
    preserves:
      "La distancia de ratón para llevar la mira al punto de la pantalla que elijas, medido desde el centro.",
    doesNotPreserve:
      "La distancia de 360° ni el comportamiento fuera de esa franja de pantalla.",
    requiresFov: true,
  },
  {
    id: "viewspeed",
    name: "Viewspeed",
    shortDescription:
      "Método comunitario que intenta igualar la velocidad percibida de la imagen.",
    preserves: "La velocidad percibida según su autor.",
    doesNotPreserve: "Ninguna distancia física concreta.",
    requiresFov: true,
  },
  {
    id: "game-specific",
    name: "Específica del juego",
    shortDescription:
      "Fórmula documentada para un par concreto de juegos.",
    preserves: "Lo que defina la fórmula verificada del par.",
    doesNotPreserve: "Cualquier comportamiento no cubierto por esa fórmula.",
    requiresFov: false,
  },
];

export type ConversionErrorCode =
  | "unknown_game"
  | "unsupported_game"
  | "missing_yaw"
  | "invalid_input"
  | "unsupported_method"
  | "missing_fov";

export interface ConversionError {
  code: ConversionErrorCode;
  message: string;
  field?: "sourceSensitivity" | "sourceDpi" | "targetDpi" | "fov" | "monitorDistance" | "method" | "game";
}

export interface ConversionInput {
  sourceGameId: string;
  targetGameId: string;
  sourceSensitivity: number;
  sourceDpi: number;
  targetDpi?: number;
  method: ConversionMethodId;
  sourceFov?: number;
  targetFov?: number;
  /** Fraction of the half-screen on the chosen axis, 0–1. Used by monitor-distance. */
  monitorDistance?: number;
  /** Axis the monitor distance is measured on. Defaults to horizontal. */
  monitorAxis?: MonitorAxis;
  /** Width / height of the source screen. Defaults to `aspectRatio`, then 16:9. */
  sourceAspectRatio?: number;
  /** Width / height of the target screen. Defaults to `aspectRatio`, then 16:9. */
  targetAspectRatio?: number;
  /** Shared aspect ratio when both screens are the same. */
  aspectRatio?: number;
}

export interface MethodAvailability {
  method: ConversionMethod;
  available: boolean;
  reason?: string;
}

export interface ConversionSuccess {
  ok: true;
  method: ConversionMethodId;
  sourceGame: GameDefinition;
  targetGame: GameDefinition;
  sourceSensitivity: number;
  targetSensitivity: number;
  targetSensitivityRounded: number;
  sourceDpi: number;
  targetDpi: number;
  sourceEdpi: number;
  targetEdpi: number;
  sourceCm360: number;
  targetCm360: number;
  sourceDegreesPerCount: number;
  targetDegreesPerCount: number;
  sourceFov?: number;
  targetFov?: number;
  sourceActualFov?: ActualFov;
  targetActualFov?: ActualFov;
  sourceAspectRatio?: number;
  targetAspectRatio?: number;
  monitorAxis?: MonitorAxis;
  monitorDistance?: number;
  fovRatio?: number;
  warnings: string[];
}

export type ConversionOutcome = ConversionSuccess | { ok: false; error: ConversionError };

const MAX_DPI = 32_000;
const MIN_DPI = 1;

export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function cm360For(
  dpi: number,
  sensitivity: number,
  yaw: number,
): number {
  return (DEGREES_PER_TURN * CM_PER_INCH) / (dpi * sensitivity * yaw);
}

export function sensitivityForCm360(
  dpi: number,
  cm360: number,
  yaw: number,
): number {
  return (DEGREES_PER_TURN * CM_PER_INCH) / (dpi * cm360 * yaw);
}

export function edpiFor(dpi: number, sensitivity: number): number {
  return dpi * sensitivity;
}

export function sensitivityToSensitivity(
  sourceSensitivity: number,
  sourceYaw: number,
  targetYaw: number,
  sourceDpi: number,
  targetDpi: number,
): number {
  return (
    sourceSensitivity *
    (sourceYaw / targetYaw) *
    (sourceDpi / targetDpi)
  );
}

/** @deprecated Usa monitorDistanceRatio de ./fov. */
export const fovRatio = monitorDistanceRatio;

const VIEWSPEED_GAP =
  "No hemos encontrado una fórmula pública y verificable de Viewspeed; no la aproximamos.";

export function getMethodAvailability(
  source: GameDefinition,
  target: GameDefinition,
): MethodAvailability[] {
  const bothConvertible = isConvertible(source) && isConvertible(target);
  const bothHaveFov = Boolean(source.fov && target.fov);
  const fovGap = [source, target]
    .filter((game) => !game.fov)
    .map((game) => game.fovGap ?? `${game.shortName} no tiene un FOV documentado.`)
    .join(" ");

  return conversionMethods.map((method) => {
    if (!bothConvertible) {
      return {
        method,
        available: false,
        reason: "Alguno de los juegos no tiene una fórmula de conversión verificada.",
      };
    }

    if (method.id === "viewspeed") {
      return { method, available: false, reason: VIEWSPEED_GAP };
    }

    if (method.id === "game-specific") {
      return {
        method,
        available: false,
        reason:
          "Todavía no hay ningún par de juegos con una fórmula específica verificada. Usa distancia 360°, focal length o distancia de monitor.",
      };
    }

    if (method.requiresFov && !bothHaveFov) {
      return {
        method,
        available: false,
        reason: fovGap || "Ambos juegos necesitan un FOV definido para este método.",
      };
    }

    return { method, available: true };
  });
}

export function convertSensitivity(input: ConversionInput): ConversionOutcome {
  const sourceGame = getGame(input.sourceGameId);
  const targetGame = getGame(input.targetGameId);

  if (!sourceGame || !targetGame) {
    return {
      ok: false,
      error: {
        code: "unknown_game",
        message: "El juego de origen o de destino no existe en el registro.",
        field: "game",
      },
    };
  }

  if (!isConvertible(sourceGame) || !isConvertible(targetGame)) {
    return {
      ok: false,
      error: {
        code: "unsupported_game",
        message:
          "Uno de los juegos seleccionados no tiene una conversión verificada. No inventamos una constante para rellenar el resultado.",
        field: "game",
      },
    };
  }

  if (
    !isValidNumber(input.sourceSensitivity) ||
    input.sourceSensitivity <= 0
  ) {
    return {
      ok: false,
      error: {
        code: "invalid_input",
        message: "La sensibilidad debe ser un número mayor que cero.",
        field: "sourceSensitivity",
      },
    };
  }

  const sourceDpi = input.sourceDpi;
  const targetDpi = input.targetDpi ?? input.sourceDpi;

  if (!isValidNumber(sourceDpi) || sourceDpi < MIN_DPI || sourceDpi > MAX_DPI) {
    return {
      ok: false,
      error: {
        code: "invalid_input",
        message: `El DPI debe estar entre ${MIN_DPI} y ${MAX_DPI}.`,
        field: "sourceDpi",
      },
    };
  }

  if (!isValidNumber(targetDpi) || targetDpi < MIN_DPI || targetDpi > MAX_DPI) {
    return {
      ok: false,
      error: {
        code: "invalid_input",
        message: `El DPI de destino debe estar entre ${MIN_DPI} y ${MAX_DPI}.`,
        field: "targetDpi",
      },
    };
  }

  const availability = getMethodAvailability(sourceGame, targetGame).find(
    (item) => item.method.id === input.method,
  );

  if (!availability) {
    return {
      ok: false,
      error: {
        code: "unsupported_method",
        message: "El método de conversión no existe.",
        field: "method",
      },
    };
  }

  if (!availability.available) {
    return {
      ok: false,
      error: {
        code: "unsupported_method",
        message:
          availability.reason ?? "Este método no está disponible para el par de juegos.",
        field: "method",
      },
    };
  }

  const warnings: string[] = [];

  const sourceSensitivity = input.sourceSensitivity;

  if (
    sourceSensitivity < sourceGame.sensitivity.min ||
    sourceSensitivity > sourceGame.sensitivity.max
  ) {
    warnings.push(
      `La sensibilidad está fuera del rango documentado para ${sourceGame.shortName} (${sourceGame.sensitivity.min}–${sourceGame.sensitivity.max}).`,
    );
  }

  let targetSensitivity = sensitivityToSensitivity(
    sourceSensitivity,
    sourceGame.yaw,
    targetGame.yaw,
    sourceDpi,
    targetDpi,
  );

  let sourceFov = input.sourceFov ?? sourceGame.fov?.default;
  let targetFov = input.targetFov ?? targetGame.fov?.default;
  let ratio: number | undefined;
  let monitorDistance: number | undefined;
  let sourceActualFov: ActualFov | undefined;
  let targetActualFov: ActualFov | undefined;
  let sourceAspectRatio: number | undefined;
  let targetAspectRatio: number | undefined;
  let monitorAxis: MonitorAxis | undefined;

  if (input.method === "fov-aware" || input.method === "monitor-distance") {
    if (sourceFov === undefined || targetFov === undefined) {
      return {
        ok: false,
        error: {
          code: "missing_fov",
          message: "Este método necesita el FOV de origen y de destino.",
          field: "fov",
        },
      };
    }

    if (
      !isValidNumber(sourceFov) ||
      !isValidNumber(targetFov) ||
      sourceFov <= 0 ||
      sourceFov >= 180 ||
      targetFov <= 0 ||
      targetFov >= 180
    ) {
      return {
        ok: false,
        error: {
          code: "invalid_input",
          message: "El FOV debe ser un número mayor que 0 y menor que 180 grados.",
          field: "fov",
        },
      };
    }

    monitorDistance =
      input.method === "monitor-distance" ? (input.monitorDistance ?? 0.5) : 0;

    if (
      input.method === "monitor-distance" &&
      (!isValidNumber(monitorDistance) ||
        monitorDistance < 0 ||
        monitorDistance > 1)
    ) {
      return {
        ok: false,
        error: {
          code: "invalid_input",
          message: "La distancia de monitor debe estar entre 0% y 100%.",
          field: "monitorDistance",
        },
      };
    }

    sourceAspectRatio = input.sourceAspectRatio ?? input.aspectRatio ?? DEFAULT_ASPECT_RATIO;
    targetAspectRatio = input.targetAspectRatio ?? input.aspectRatio ?? DEFAULT_ASPECT_RATIO;
    const validAspect = (value: number) => isValidNumber(value) && value >= 0.5 && value <= 5;
    if (!validAspect(sourceAspectRatio) || !validAspect(targetAspectRatio)) {
      return {
        ok: false,
        error: {
          code: "invalid_input",
          message: "La resolución no es válida: indica ancho y alto en píxeles.",
          field: "fov",
        },
      };
    }

    // getMethodAvailability already guarantees both games declare a FOV.
    const sourceScale = sourceGame.fov!.scale;
    const targetScale = targetGame.fov!.scale;
    sourceActualFov = actualFov(sourceFov, sourceScale, sourceAspectRatio);
    targetActualFov = actualFov(targetFov, targetScale, targetAspectRatio);
    monitorAxis = input.monitorAxis ?? "horizontal";

    for (const [game, value] of [
      [sourceGame, sourceFov],
      [targetGame, targetFov],
    ] as const) {
      if (game.fov && (value < game.fov.min || value > game.fov.max)) {
        warnings.push(
          `El FOV de ${game.shortName} (${value}) está fuera de su rango documentado (${game.fov.min}–${game.fov.max}).`,
        );
      }
      if (game.fov?.verification === "experimental") {
        warnings.push(
          `La forma en que ${game.shortName} mide el FOV procede de fuentes comunitarias: ${game.fov.note}`,
        );
      }
    }

    const useVertical = input.method === "monitor-distance" && monitorAxis === "vertical";
    ratio = monitorDistanceRatio(
      useVertical ? sourceActualFov.vertical : sourceActualFov.horizontal,
      useVertical ? targetActualFov.vertical : targetActualFov.horizontal,
      monitorDistance,
    );
    targetSensitivity *= ratio;
  } else {
    sourceFov = undefined;
    targetFov = undefined;
  }

  if (
    !isValidNumber(targetSensitivity) ||
    !Number.isFinite(targetSensitivity) ||
    targetSensitivity <= 0
  ) {
    return {
      ok: false,
      error: {
        code: "invalid_input",
        message: "La conversión produjo un valor no válido. Revisa los datos introducidos.",
      },
    };
  }

  if (targetSensitivity < targetGame.sensitivity.min) {
    warnings.push(
      `El resultado (${targetSensitivity.toFixed(targetGame.sensitivity.decimals)}) queda por debajo del mínimo habitual de ${targetGame.shortName}. Puede que el juego no acepte ese valor.`,
    );
  } else if (targetSensitivity > targetGame.sensitivity.max) {
    warnings.push(
      `El resultado (${targetSensitivity.toFixed(targetGame.sensitivity.decimals)}) supera el máximo habitual de ${targetGame.shortName}. Puede que el juego no acepte ese valor.`,
    );
  }

  if (sourceGame.verification === "experimental") {
    warnings.push(
      `${sourceGame.shortName} está marcado como experimental: su constante no está confirmada con la misma solidez que el resto.`,
    );
  }

  if (targetGame.verification === "experimental") {
    warnings.push(
      `${targetGame.shortName} está marcado como experimental: su constante no está confirmada con la misma solidez que el resto.`,
    );
  }

  const sourceCm360 = cm360For(sourceDpi, sourceSensitivity, sourceGame.yaw);
  const targetCm360 = cm360For(targetDpi, targetSensitivity, targetGame.yaw);
  const factor = Math.pow(10, targetGame.sensitivity.decimals);
  const targetSensitivityRounded =
    Math.round(targetSensitivity * factor) / factor;

  return {
    ok: true,
    method: input.method,
    sourceGame,
    targetGame,
    sourceSensitivity,
    targetSensitivity,
    targetSensitivityRounded,
    sourceDpi,
    targetDpi,
    sourceEdpi: edpiFor(sourceDpi, sourceSensitivity),
    targetEdpi: edpiFor(targetDpi, targetSensitivity),
    sourceCm360,
    targetCm360,
    sourceDegreesPerCount: sourceSensitivity * sourceGame.yaw,
    targetDegreesPerCount: targetSensitivity * targetGame.yaw,
    sourceFov,
    targetFov,
    sourceActualFov,
    targetActualFov,
    sourceAspectRatio,
    targetAspectRatio,
    monitorAxis,
    monitorDistance,
    fovRatio: ratio,
    warnings,
  };
}
