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
  /** Fixed horizontal FOV in degrees, when the game does not allow changing it. */
  fixed?: number;
  /** Default horizontal FOV in degrees, used as a starting point. */
  default: number;
  min: number;
  max: number;
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
