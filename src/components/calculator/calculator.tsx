"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Clipboard,
  Lock,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
} from "lucide-react";
import { GameSelect } from "@/components/games/game-select";
import { NumberField } from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";
import {
  conversionMethods,
  convertSensitivity,
  getMethodAvailability,
  type ConversionMethodId,
} from "@/lib/conversion/engine";
import {
  defaultSourceGameId,
  defaultTargetGameId,
  getConvertibleGames,
  getGame,
} from "@/lib/games/registry";
import type { GameDefinition } from "@/lib/games/types";
import { cn } from "@/lib/cn";
import { formatMeasure, formatSensitivity, parseDecimal } from "@/lib/format";
import { saveCalculatorProfile } from "@/app/actions";

const convertibleGames = getConvertibleGames();

interface CalculatorProps {
  canSave: boolean;
  initial?: {
    sourceGameId?: string;
    targetGameId?: string;
    sensitivity?: string;
    dpi?: string;
  };
}

function fovFor(game: GameDefinition): string {
  if (!game.fov) return "";
  return String(game.fov.fixed ?? game.fov.default);
}

function gameFromId(id: string | undefined, fallback: string): GameDefinition {
  const game = id ? getGame(id) : undefined;
  return game && game.yaw ? game : (getGame(fallback) as GameDefinition);
}

export function Calculator({ canSave, initial }: CalculatorProps) {
  const initialSource = gameFromId(initial?.sourceGameId, defaultSourceGameId);
  const initialTarget = gameFromId(initial?.targetGameId, defaultTargetGameId);

  const [sourceId, setSourceId] = useState(initialSource.id);
  const [targetId, setTargetId] = useState(initialTarget.id);
  const [sourceSensitivity, setSourceSensitivity] = useState(
    initial?.sensitivity ?? String(initialSource.defaultSensitivity),
  );
  const [dpi, setDpi] = useState(initial?.dpi ?? "800");
  const [targetDpi, setTargetDpi] = useState(initial?.dpi ?? "800");
  const [sameDpi, setSameDpi] = useState(true);
  const [method, setMethod] = useState<ConversionMethodId>("cm360");
  const [sourceFov, setSourceFov] = useState(fovFor(initialSource));
  const [targetFov, setTargetFov] = useState(fovFor(initialTarget));
  const [monitorDistance, setMonitorDistance] = useState("50");
  const [copied, setCopied] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<{
    status: "ok" | "error";
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const sourceGame = getGame(sourceId) ?? initialSource;
  const targetGame = getGame(targetId) ?? initialTarget;
  const availability = getMethodAvailability(sourceGame, targetGame);
  const selectedAvailability = availability.find(
    (item) => item.method.id === method,
  );
  const activeMethod: ConversionMethodId =
    selectedAvailability?.available === true ? method : "cm360";

  const sensitivityNumber = parseDecimal(sourceSensitivity);
  const dpiNumber = parseDecimal(dpi);
  const targetDpiNumber = sameDpi ? dpiNumber : parseDecimal(targetDpi);
  const monitorFraction = parseDecimal(monitorDistance) / 100;

  const outcome = convertSensitivity({
    sourceGameId: sourceGame.id,
    targetGameId: targetGame.id,
    sourceSensitivity: sensitivityNumber,
    sourceDpi: dpiNumber,
    targetDpi: targetDpiNumber,
    method: activeMethod,
    sourceFov: sourceFov ? parseDecimal(sourceFov) : undefined,
    targetFov: targetFov ? parseDecimal(targetFov) : undefined,
    monitorDistance: monitorFraction,
  });

  const result = outcome.ok ? outcome : null;

  function fieldError(field: string): string | undefined {
    if (!outcome.ok && outcome.error.field === field) {
      return outcome.error.message;
    }
    return undefined;
  }

  function selectSource(gameId: string) {
    const game = getGame(gameId);
    setSourceId(gameId);
    if (game) setSourceFov(fovFor(game));
    setSaveState(null);
  }

  function selectTarget(gameId: string) {
    const game = getGame(gameId);
    setTargetId(gameId);
    if (game) setTargetFov(fovFor(game));
    setSaveState(null);
  }

  function swap() {
    if (!result) return;
    const nextSourceSens = formatSensitivity(
      result.targetSensitivity,
      result.targetGame.sensitivity.decimals,
    );
    setSourceId(targetId);
    setTargetId(sourceId);
    setSourceSensitivity(nextSourceSens);
    setSourceFov(fovFor(targetGame));
    setTargetFov(fovFor(sourceGame));
    if (!sameDpi) {
      const nextSourceDpi = String(result.targetDpi);
      const nextTargetDpi = String(result.sourceDpi);
      setDpi(nextSourceDpi);
      setTargetDpi(nextTargetDpi);
    }
    setSaveState(null);
  }

  function reset() {
    const source = getGame(defaultSourceGameId) as GameDefinition;
    const target = getGame(defaultTargetGameId) as GameDefinition;
    setSourceId(source.id);
    setTargetId(target.id);
    setSourceSensitivity(String(source.defaultSensitivity));
    setDpi("800");
    setTargetDpi("800");
    setSameDpi(true);
    setMethod("cm360");
    setSourceFov(fovFor(source));
    setTargetFov(fovFor(target));
    setMonitorDistance("50");
    setSaveState(null);
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied("error");
      window.setTimeout(() => setCopied(null), 2200);
    }
  }

  async function copyShareLink() {
    if (!result) return;
    const params = new URLSearchParams({
      game: result.sourceGame.id,
      target: result.targetGame.id,
      sens: String(result.sourceSensitivity),
      dpi: String(result.sourceDpi),
      method: result.method,
    });
    await copyText("share", `${window.location.origin}/?${params.toString()}`);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveState(null);
    const sourceFovNumber = sourceFov ? parseDecimal(sourceFov) : undefined;
    const response = await saveCalculatorProfile({
      name: `${result.sourceGame.shortName} → ${result.targetGame.shortName}`,
      gameId: result.sourceGame.id,
      dpi: result.sourceDpi,
      sensitivity: result.sourceSensitivity,
      method: result.method,
      fov:
        sourceFovNumber !== undefined && Number.isFinite(sourceFovNumber)
          ? sourceFovNumber
          : undefined,
      cm360: result.sourceCm360,
      notes: "",
    });
    setSaving(false);
    setSaveState({
      status: response.ok ? "ok" : "error",
      message: response.message,
    });
  }

  const selectedMethod = conversionMethods.find(
    (item) => item.id === activeMethod,
  );
  const methodDisabled = selectedAvailability?.available === false;

  return (
    <section
      className="glass overflow-visible p-3 sm:p-4 lg:p-5"
      aria-labelledby="calculator-title"
      data-testid="calculator"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4 pt-1">
        <div>
          <p className="eyebrow">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Conversión en vivo
          </p>
          <h2 id="calculator-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            De tu juego actual al siguiente
          </h2>
        </div>
        <span className="badge badge-accent mono">
          {activeMethod === "cm360" ? "360°" : activeMethod === "fov-aware" ? "FOV" : activeMethod === "monitor-distance" ? `${monitorDistance || "0"}% monitor` : activeMethod}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
        <div className="glass-inset flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">
              01 · Origen
            </span>
            <span className="badge">{sourceGame.verification === "verified" ? "Verificado" : "Experimental"}</span>
          </div>

          <GameSelect
            label="Juego de origen"
            games={convertibleGames}
            value={sourceId}
            onChange={selectSource}
            excludeId={undefined}
          />

          <NumberField
            label="Sensibilidad en el juego"
            value={sourceSensitivity}
            onChange={setSourceSensitivity}
            unit={sourceGame.sensitivity.unit ?? "sens"}
            step={sourceGame.sensitivity.step}
            min={0}
            hint={sourceGame.sensitivity.note}
            error={fieldError("sourceSensitivity")}
          />

          <NumberField
            label="DPI del ratón"
            value={dpi}
            onChange={setDpi}
            unit="DPI"
            step={1}
            min={1}
            max={32000}
            error={fieldError("sourceDpi")}
            hint="El DPI efectivo de tu ratón en Windows o en el software del fabricante."
          />
        </div>

        <div className="flex items-center justify-center lg:flex-col">
          <button
            type="button"
            onClick={swap}
            disabled={!result}
            className="btn btn-secondary btn-icon size-11 rounded-full"
            aria-label="Intercambiar juego de origen y destino"
            title="Intercambiar origen y destino"
          >
            <ArrowLeftRight className="size-4 rotate-90 lg:rotate-0" aria-hidden="true" />
          </button>
          <span className="mx-2 hidden text-[0.58rem] uppercase tracking-[0.2em] text-[var(--faint)] lg:mx-0 lg:mt-2 lg:block">
            swap
          </span>
        </div>

        <div className="result-surface flex flex-col gap-4 rounded-[var(--radius-md)] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]/80">
              02 · Destino
            </span>
            <span className="badge badge-accent">{targetGame.verification === "verified" ? "Verificado" : "Experimental"}</span>
          </div>

          <GameSelect
            label="Juego de destino"
            games={convertibleGames}
            value={targetId}
            onChange={selectTarget}
          />

          <div className="rounded-[var(--radius-md)] border border-white/[0.07] bg-black/25 px-4 py-5">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Sensibilidad recomendada
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <output
                className="mono block text-[clamp(2.6rem,7vw,4.1rem)] font-semibold leading-none tracking-[-0.055em] text-white"
                aria-live="polite"
                aria-atomic="true"
                data-testid="target-sensitivity"
              >
                {result
                  ? formatSensitivity(
                      result.targetSensitivityRounded,
                      result.targetGame.sensitivity.decimals,
                    )
                  : "—"}
              </output>
              <div className="flex flex-col items-end gap-2 pb-1">
                <span className="text-[0.68rem] text-[var(--faint)]">
                  {targetGame.sensitivity.unit ?? "sens"}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!result}
                  onClick={() =>
                    result &&
                    copyText(
                      "sens",
                      formatSensitivity(
                        result.targetSensitivityRounded,
                        result.targetGame.sensitivity.decimals,
                      ),
                    )
                  }
                  aria-label="Copiar sensibilidad de destino"
                >
                  {copied === "sens" ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Clipboard className="size-3.5" aria-hidden="true" />
                  )}
                  {copied === "sens" ? "Copiada" : "Copiar"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--muted)]">
              Redondeado a {targetGame.sensitivity.decimals} decimales, la
              precisión que acepta {targetGame.shortName}. Ajusta el valor exacto
              en el juego si el slider no coincide.
            </p>
          </div>

          <div>
            <div className="field-label">
              <span>DPI de destino</span>
              <span className="mono text-[0.66rem] font-normal text-[var(--faint)]">
                {sameDpi ? "mismo que origen" : "personalizado"}
              </span>
            </div>
            <div className="glass-inset inline-flex w-full items-center gap-1 p-1">
              <button
                type="button"
                onClick={() => setSameDpi(true)}
                aria-pressed={sameDpi}
                className={cn(
                  "flex-1 rounded-[7px] px-2 py-1.5 text-[0.72rem] font-medium transition-colors",
                  sameDpi
                    ? "bg-white/[0.09] text-white"
                    : "text-[var(--muted)] hover:text-white",
                )}
              >
                Usar {dpi || "—"} DPI
              </button>
              <button
                type="button"
                onClick={() => setSameDpi(false)}
                aria-pressed={!sameDpi}
                className={cn(
                  "flex-1 rounded-[7px] px-2 py-1.5 text-[0.72rem] font-medium transition-colors",
                  !sameDpi
                    ? "bg-white/[0.09] text-white"
                    : "text-[var(--muted)] hover:text-white",
                )}
              >
                Personalizado
              </button>
            </div>
            {!sameDpi ? (
              <div className="mt-2">
                <NumberField
                  label="DPI del ratón en destino"
                  value={targetDpi}
                  onChange={setTargetDpi}
                  unit="DPI"
                  step={1}
                  min={1}
                  max={32000}
                  error={fieldError("targetDpi")}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 glass-inset p-4 sm:p-5">
        <fieldset>
          <legend className="field-label mb-3">
            <span>Qué quieres conservar</span>
            <span className="hidden text-[0.66rem] font-normal text-[var(--faint)] sm:inline">
              Los métodos no son intercambiables
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {availability.map(({ method: item, available, reason }) => {
              const checked = activeMethod === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    "group relative flex cursor-pointer flex-col gap-1 rounded-[12px] border p-3 transition-colors",
                    checked
                      ? "border-[var(--line-accent)] bg-[var(--accent)]/[0.07]"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]",
                    !available && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[0.8rem] font-semibold">
                      <input
                        type="radio"
                        name="conversion-method"
                        value={item.id}
                        checked={checked}
                        disabled={!available}
                        onChange={() => setMethod(item.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-3.5 place-items-center rounded-full border",
                          checked ? "border-[var(--accent)]" : "border-white/25",
                        )}
                      >
                        {checked ? (
                          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                        ) : null}
                      </span>
                      {item.name}
                    </span>
                    {item.id === "cm360" ? (
                      <span className="badge badge-accent text-[0.58rem]">base</span>
                    ) : null}
                  </span>
                  <span className="pl-[1.4rem] text-[0.68rem] leading-relaxed text-[var(--muted)]">
                    {item.shortDescription}
                  </span>
                  {!available ? (
                    <span className="pl-[1.4rem] text-[0.62rem] leading-relaxed text-[var(--faint)]">
                      {reason}
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        {selectedMethod?.requiresFov ? (
          <details className="mt-3 rounded-[12px] border border-white/[0.07] bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[0.75rem] font-medium text-[var(--text-soft)]">
              <span className="flex items-center gap-2">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                Ajustes de FOV
              </span>
              <span className="mono text-[0.65rem] text-[var(--faint)]">
                {sourceFov || "—"}° → {targetFov || "—"}°
              </span>
            </summary>
            <div className="grid gap-3 border-t border-white/[0.06] p-3 sm:grid-cols-2">
              <NumberField
                label={`FOV de ${sourceGame.shortName}`}
                value={sourceFov}
                onChange={setSourceFov}
                unit="°"
                step={0.1}
                min={1}
                max={179}
                readOnly={Boolean(sourceGame.fov?.fixed)}
                hint={sourceGame.fov?.note}
                error={fieldError("fov")}
              />
              <NumberField
                label={`FOV de ${targetGame.shortName}`}
                value={targetFov}
                onChange={setTargetFov}
                unit="°"
                step={0.1}
                min={1}
                max={179}
                readOnly={Boolean(targetGame.fov?.fixed)}
                hint={targetGame.fov?.note}
              />
              {activeMethod === "monitor-distance" ? (
                <div className="sm:col-span-2">
                  <NumberField
                    label="Distancia de monitor"
                    value={monitorDistance}
                    onChange={setMonitorDistance}
                    unit="%"
                    step={5}
                    min={0}
                    max={100}
                    error={fieldError("monitorDistance")}
                    hint="Porcentaje del ancho de pantalla que quieres recorrer con la misma distancia física. 50% es un punto medio habitual."
                  />
                </div>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
        <div className="glass-inset p-4 sm:p-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
              Resultado
            </h3>
            <span className="badge">
              {selectedMethod?.name}
            </span>
          </div>

          {result ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="cm/360 origen" value={`${formatMeasure(result.sourceCm360)} cm`} />
                <Metric label="cm/360 destino" value={`${formatMeasure(result.targetCm360)} cm`} />
                <Metric label="eDPI origen" value={formatMeasure(result.sourceEdpi, 0)} />
                <Metric label="eDPI destino" value={formatMeasure(result.targetEdpi, 0)} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-[var(--muted)]">
                <span>
                  {formatSensitivity(result.sourceSensitivity, sourceGame.sensitivity.decimals)} sens
                  × {result.sourceDpi} DPI
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatMeasure(result.sourceDegreesPerCount, 3)}°/count →{" "}
                  {formatMeasure(result.targetDegreesPerCount, 3)}°/count
                </span>
                {activeMethod !== "cm360" ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      FOV {formatMeasure(result.sourceFov ?? 0, 1)}° →{" "}
                      {formatMeasure(result.targetFov ?? 0, 1)}°
                    </span>
                  </>
                ) : null}
              </div>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--faint)]">
                {selectedMethod?.preserves} No conserva: {selectedMethod?.doesNotPreserve.toLowerCase()}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
              {outcome.ok ? "" : outcome.error.message}
            </p>
          )}

          {result && result.warnings.length > 0 ? (
            <ul className="mt-3 grid gap-1.5">
              {result.warnings.map((warning) => (
                <li
                  key={warning}
                  className="flex items-start gap-2 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/[0.05] px-2.5 py-2 text-[0.68rem] leading-relaxed text-[#fde68a]"
                >
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}

          {methodDisabled && method !== activeMethod ? (
            <p className="mt-3 text-[0.68rem] text-[var(--warning)]">
              El método seleccionado no está disponible; se muestra distancia 360°.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              disabled={!result || copied === "share"}
              onClick={copyShareLink}
            >
              {copied === "share" ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Share2 className="size-4" aria-hidden="true" />
              )}
              {copied === "share" ? "Enlace copiado" : "Compartir"}
            </Button>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reiniciar
            </Button>
          </div>

          {canSave ? (
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!result || saving}
              className="w-full"
            >
              <Save className="size-4" aria-hidden="true" />
              {saving ? "Guardando…" : "Guardar en mi cuenta"}
            </Button>
          ) : (
            <Link
              href="/login?next=/"
              className="btn btn-secondary w-full"
            >
              <Lock className="size-4" aria-hidden="true" />
              Entra para guardar perfiles
            </Link>
          )}

          {saveState ? (
            <p
              role="status"
              className={cn(
                "rounded-lg border px-3 py-2 text-[0.7rem] leading-relaxed",
                saveState.status === "ok"
                  ? "border-[var(--success)]/25 bg-[var(--success)]/[0.06] text-[#a7f3d0]"
                  : "border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] text-[#fecdd3]",
              )}
            >
              {saveState.message}
            </p>
          ) : null}

          <p className="mt-auto px-1 text-[0.65rem] leading-relaxed text-[var(--faint)]">
            La conversión es matemática; la sensación también depende del FOV,
            el zoom, la aceleración y la respuesta del juego.
          </p>
        </div>
      </div>

      {copied === "error" ? (
        <p className="px-1 pt-2 text-[0.7rem] text-[var(--danger)]" role="status">
          No se pudo copiar al portapapeles. Revisa los permisos del navegador.
        </p>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2">
      <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[var(--faint)]">{label}</p>
      <p className="mono mt-1 text-sm font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
