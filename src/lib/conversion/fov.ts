/**
 * Field-of-view conventions and monitor-distance maths.
 *
 * Every game exposes its FOV in its own units. To compare two games we turn
 * the configured value into the real horizontal and vertical FOV on the
 * player's monitor, then match the angle covered by the same fraction of the
 * screen (monitor distance). All conventions here are Hor+: the vertical FOV
 * stays fixed and wider monitors see more to the sides.
 */

/**
 * How a game's FOV setting is measured.
 * - `hdeg-4:3`: horizontal degrees as if the screen were 4:3 (Source engine).
 * - `hdeg-16:9`: horizontal degrees as if the screen were 16:9.
 * - `vdeg`: vertical degrees.
 */
export type FovScale = "hdeg-4:3" | "hdeg-16:9" | "vdeg";

export const fovScaleLabels: Record<FovScale, string> = {
  "hdeg-4:3": "Horizontal 4:3",
  "hdeg-16:9": "Horizontal 16:9",
  vdeg: "Vertical",
};

export interface AspectRatioOption {
  id: string;
  label: string;
  value: number;
}

export const aspectRatios: AspectRatioOption[] = [
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "16:10", label: "16:10", value: 16 / 10 },
  { id: "21:9", label: "21:9 (64:27)", value: 64 / 27 },
  { id: "32:9", label: "32:9", value: 32 / 9 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "5:4", label: "5:4", value: 5 / 4 },
];

export const defaultAspectRatioId = "16:9";

export function getAspectRatio(id: string | undefined): AspectRatioOption {
  return (
    aspectRatios.find((item) => item.id === id) ??
    (aspectRatios.find((item) => item.id === defaultAspectRatioId) as AspectRatioOption)
  );
}

export type MonitorAxis = "horizontal" | "vertical";

const DEG = Math.PI / 180;

function halfTan(fovDegrees: number): number {
  return Math.tan((fovDegrees / 2) * DEG);
}

function fromHalfTan(value: number): number {
  return (2 * Math.atan(value)) / DEG;
}

export interface ActualFov {
  horizontal: number;
  vertical: number;
}

/** Real horizontal and vertical FOV for a configured value on a given monitor. */
export function actualFov(
  configured: number,
  scale: FovScale,
  aspectRatio: number,
): ActualFov {
  let verticalHalfTan: number;

  switch (scale) {
    case "hdeg-4:3":
      verticalHalfTan = halfTan(configured) * (3 / 4);
      break;
    case "hdeg-16:9":
      verticalHalfTan = halfTan(configured) * (9 / 16);
      break;
    case "vdeg":
      verticalHalfTan = halfTan(configured);
      break;
  }

  return {
    vertical: fromHalfTan(verticalHalfTan),
    horizontal: fromHalfTan(verticalHalfTan * aspectRatio),
  };
}

/**
 * Ratio between the angles covered by the same fraction of the screen.
 * `fraction` is measured from the centre: 0 is the crosshair (focal length,
 * a tangent ratio) and 1 is the edge of the chosen axis.
 */
export function monitorDistanceRatio(
  sourceFov: number,
  targetFov: number,
  fraction: number,
): number {
  const source = halfTan(sourceFov);
  const target = halfTan(targetFov);

  if (fraction <= 0) return target / source;

  return Math.atan(fraction * target) / Math.atan(fraction * source);
}
