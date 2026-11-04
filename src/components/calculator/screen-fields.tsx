"use client";

import { useId } from "react";
import { NumberField } from "@/components/ui/number-field";
import { actualFov, aspectFromResolution, fovScaleLabels } from "@/lib/conversion/fov";
import type { GameDefinition } from "@/lib/games/types";
import { formatMeasure, parseDecimal } from "@/lib/format";

interface ScreenFieldsProps {
  game: GameDefinition;
  width: string;
  height: string;
  fov: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onFovChange: (value: string) => void;
  fovError?: string;
}

/** Resolution and in-game FOV of one side, with the real FOV it produces. */
export function ScreenFields({
  game,
  width,
  height,
  fov,
  onWidthChange,
  onHeightChange,
  onFovChange,
  fovError,
}: ScreenFieldsProps) {
  const id = useId();
  const aspect = aspectFromResolution(parseDecimal(width), parseDecimal(height));
  const fovValue = parseDecimal(fov);
  const real =
    game.fov && Number.isFinite(aspect) && Number.isFinite(fovValue) && fovValue > 0 && fovValue < 180
      ? actualFov(fovValue, game.fov.scale, aspect)
      : null;
  const resolutionInvalid = !Number.isFinite(aspect);

  return (
    <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="field-label">
          <span id={`${id}-res`}>Resolución</span>
          <span className="mono text-xs font-normal text-[var(--faint)]">px</span>
        </div>
        <div className="flex items-center gap-2" role="group" aria-labelledby={`${id}-res`}>
          <input
            className="field-input min-w-0"
            inputMode="numeric"
            type="number"
            min={1}
            step={1}
            value={width}
            onChange={(event) => onWidthChange(event.target.value)}
            aria-label={`Ancho de pantalla en ${game.shortName}`}
            aria-invalid={resolutionInvalid || undefined}
          />
          <span className="text-sm text-[var(--faint)]" aria-hidden="true">
            ×
          </span>
          <input
            className="field-input min-w-0"
            inputMode="numeric"
            type="number"
            min={1}
            step={1}
            value={height}
            onChange={(event) => onHeightChange(event.target.value)}
            aria-label={`Alto de pantalla en ${game.shortName}`}
            aria-invalid={resolutionInvalid || undefined}
          />
        </div>
        <p className={resolutionInvalid ? "field-error" : "field-hint"}>
          {resolutionInvalid
            ? "Indica ancho y alto en píxeles."
            : `Relación ${formatMeasure(aspect, 3)}:1. Si juegas estirado, usa la resolución del juego.`}
        </p>
      </div>

      {game.fov ? (
        <NumberField
          label={`FOV · ${fovScaleLabels[game.fov.scale]}`}
          value={fov}
          onChange={onFovChange}
          unit="°"
          step={0.1}
          min={game.fov.min}
          max={game.fov.max}
          readOnly={Boolean(game.fov.fixed)}
          error={fovError}
          hint={
            real
              ? `${game.fov.fixed ? "Fijo en el juego. " : ""}Real: ${formatMeasure(real.horizontal, 1)}° H · ${formatMeasure(real.vertical, 1)}° V.`
              : game.fov.note
          }
        />
      ) : (
        <div>
          <span className="field-label">FOV</span>
          <p className="rounded-lg border border-dashed border-[var(--line-strong)] px-3 py-2.5 text-xs leading-relaxed text-[var(--muted)]">
            {game.fovGap ?? `${game.shortName} no tiene un FOV documentado.`}
          </p>
        </div>
      )}
    </div>
  );
}
