import type { GameDefinition, ZoomLevel } from "@/lib/games/types";
import { actualFov, monitorDistanceRatio, type MonitorAxis } from "./fov";

export interface ZoomInput {
  game: GameDefinition;
  /** Hip-fire FOV in the game's own units. */
  hipFov: number;
  aspectRatio: number;
  /**
   * What the scope should keep from hip-fire:
   * - `cm360`: the same distance for a full turn.
   * - `monitor`: the same screen fraction (0 = focal length).
   */
  match: "cm360" | "monitor";
  monitorDistance: number;
  monitorAxis: MonitorAxis;
}

export interface ZoomRecommendation {
  level: ZoomLevel;
  /** Scoped degrees per count divided by hip-fire degrees per count. */
  ratio: number;
  /** Value for the game's zoom setting that produces that ratio. */
  setting: number;
  settingRounded: number;
}

/**
 * Zoom setting that makes each scope match hip-fire with the chosen method.
 * Returns null when the game has no verified zoom model or the inputs are not
 * valid; never a guessed value.
 */
export function zoomRecommendations(input: ZoomInput): ZoomRecommendation[] | null {
  const { game, hipFov, aspectRatio } = input;
  const zoom = game.zoom;
  const fov = game.fov;

  if (!zoom || !fov) return null;
  if (!Number.isFinite(hipFov) || hipFov <= 0 || hipFov >= 180) return null;
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return null;
  if (
    input.match === "monitor" &&
    (!Number.isFinite(input.monitorDistance) ||
      input.monitorDistance < 0 ||
      input.monitorDistance > 1)
  ) {
    return null;
  }

  const hip = actualFov(hipFov, fov.scale, aspectRatio);
  const factor = Math.pow(10, zoom.decimals);

  return zoom.levels.map((level) => {
    const scoped = actualFov(level.fov, fov.scale, aspectRatio);
    const vertical = input.monitorAxis === "vertical";
    const ratio =
      input.match === "cm360"
        ? 1
        : monitorDistanceRatio(
            vertical ? hip.vertical : hip.horizontal,
            vertical ? scoped.vertical : scoped.horizontal,
            input.monitorDistance,
          );

    // source-linear: scoped = hip × (zoomFov / hipFov) × setting.
    const setting = ratio / (level.fov / hipFov);

    return {
      level,
      ratio,
      setting,
      settingRounded: Math.round(setting * factor) / factor,
    };
  });
}
