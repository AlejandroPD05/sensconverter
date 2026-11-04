import type { FovScale } from "@/lib/conversion/fov";

export type VerificationStatus =
  | "verified"
  | "experimental"
  | "pending"
  | "unsupported";

export type ConversionCapability =
  | "cm360"
  | "sensToSens"
  | "fovAware"
  | "monitorDistance"
  | "scoped"
  | "ads";

export interface YawSource {
  label: string;
  url: string;
}

export interface GameFovConfig {
  /** How the in-game value is measured. */
  scale: FovScale;
  /** Fixed value in the game's own units, when the game does not allow changing it. */
  fixed?: number;
  /** Starting value in the game's own units. */
  default: number;
  min: number;
  max: number;
  note: string;
  /** Where the range and the measurement convention come from. */
  source: YawSource;
  /** `experimental` when sources disagree or only community testing backs it. */
  verification: "verified" | "experimental";
}

export interface ZoomLevel {
  id: string;
  name: string;
  /** Zoomed FOV in the same units as the game's FOV setting. */
  fov: number;
}

/**
 * How scoped sensitivity scales. Only models with a verifiable source are
 * declared; games without one have no zoom data at all.
 * - `source-linear`: sensitivity × (zoomFOV / hipFOV) × setting (Source SDK).
 */
export interface GameZoomConfig {
  model: "source-linear";
  settingName: string;
  settingDefault: number;
  decimals: number;
  levels: ZoomLevel[];
  source: YawSource;
  verification: "verified" | "experimental";
  note: string;
}

export interface GameSensitivityConfig {
  min: number;
  max: number;
  step: number;
  decimals: number;
  /** Unit shown next to the input, e.g. "%" for Fortnite. */
  unit?: string;
  note?: string;
}

export interface GameDefinition {
  id: string;
  name: string;
  shortName: string;
  developer: string;
  releaseYear?: number;
  platforms: Array<"pc" | "console">;
  /** `yaw` means the linear yaw model documented in the methodology page. */
  inputModel: "yaw" | "unknown";
  /** Degrees of rotation per mouse count at sensitivity 1.0. */
  yaw?: number;
  yawSource?: YawSource;
  capabilities: ConversionCapability[];
  sensitivity: GameSensitivityConfig;
  fov?: GameFovConfig;
  zoom?: GameZoomConfig;
  /** Why FOV or zoom data is missing, shown instead of the controls. */
  fovGap?: string;
  zoomGap?: string;
  defaultSensitivity: number;
  verification: VerificationStatus;
  lastVerified?: string;
  notes: string[];
}

export function isConvertible(
  game: GameDefinition,
): game is GameDefinition & { yaw: number } {
  return (
    typeof game.yaw === "number" &&
    Number.isFinite(game.yaw) &&
    game.yaw > 0 &&
    (game.verification === "verified" ||
      game.verification === "experimental")
  );
}

export function hasCapability(
  game: GameDefinition,
  capability: ConversionCapability,
): boolean {
  return game.capabilities.includes(capability);
}
