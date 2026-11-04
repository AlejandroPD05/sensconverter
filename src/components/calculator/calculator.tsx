"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { publishLiveReadout } from "@/lib/live-readout";
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

  // La franja del encabezado lee este resultado. Se publica tras cada render
  // y se limpia al desmontar la calculadora.
  useEffect(() => {
    if (!result) {
      publishLiveReadout(null);
      return;
    }
    publishLiveReadout({
      sourceShort: result.sourceGame.shortName,
      sourceSensitivity: formatSensitivity(
        result.sourceSensitivity,
        result.sourceGame.sensitivity.decimals,
      ),
      sourceDpi: result.sourceDpi,
      targetShort: result.targetGame.shortName,
      targetSensitivity: formatSensitivity(
        result.targetSensitivityRounded,
        result.targetGame.sensitivity.decimals,
      ),
      cm360: result.sourceCm360,
      edpi: result.sourceEdpi,
    });
  });

  useEffect(() => () => publishLiveReadout(null), []);

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
  const resultValue = result
    ? formatSensitivity(
        result.targetSensitivityRounded,
        result.targetGame.sensitivity.decimals,
      )
    : "—";

  return (
    <section
      className="border border-[var(--ink)] bg-[var(--paper-raise)]"
      aria-labelledby="calculator-title"
      data-testid="calculator"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)] px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2
            id="calculator-title"
            className="text-[0.78rem] font-bold uppercase tracking-[0.08em]"
          >
            Conversión
          </h2>
          <span className="mono text-[0.6rem] uppercase tracking-[0.06em] text-[var(--faint)]">
            en vivo · cm/360
          </span>
        </div>
        <span className="badge badge-accent mono">
          {activeMethod === "cm360"
            ? "360°"
            : activeMethod === "fov-aware"
              ? "FOV"
              : activeMethod === "monitor-distance"
                ? `${monitorDistance || "0"}% monitor`
                : activeMethod}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-2">
            <span className="label">Origen</span>
            <span
              className={
                sourceGame.verification === "verified"
                  ? "badge badge-success"
                  : "badge badge-warning"
              }
            >
              {sourceGame.verification === "verified" ? "Verificado" : "Experimental"}
            </span>
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

        <div className="flex items-center justify-center border-y border-[var(--line)] p-2 lg:border-x lg:border-y-0">
          <button
            type="button"
            onClick={swap}
            disabled={!result}
            className="btn btn-secondary btn-icon"
            aria-label="Intercambiar juego de origen y destino"
            title="Intercambiar origen y destino"
          >
            <ArrowLeftRight className="size-4 rotate-90 lg:rotate-0" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-2">
            <span className="label">Destino</span>
            <span
              className={
                targetGame.verification === "verified"
                  ? "badge badge-success"
                  : "badge badge-warning"
              }
            >
              {targetGame.verification === "verified" ? "Verificado" : "Experimental"}
            </span>
          </div>

          <GameSelect
            label="Juego de destino"
            games={convertibleGames}
            value={targetId}
            onChange={selectTarget}
          />

          <div className="result-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="mono text-[0.58rem] font-medium uppercase tracking-[0.07em]">
                Sensibilidad recomendada
              </p>
              <span className="mono text-[0.58rem] uppercase tracking-[0.07em]">
                {targetGame.sensitivity.unit ?? "sens"}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <output
                key={resultValue}
                className="mono result-in block text-[clamp(2.5rem,6.5vw,3.6rem)] font-bold leading-none tracking-[-0.06em]"
                aria-live="polite"
                aria-atomic="true"
                data-testid="target-sensitivity"
              >
                {resultValue}
              </output>
              <Button
                variant="secondary"
                size="sm"
                disabled={!result}
                onClick={() => result && copyText("sens", resultValue)}
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

            <CmScale value={result?.sourceCm360 ?? null} />

            <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--ink)]/75">
              Redondeado a {targetGame.sensitivity.decimals} decimales, la
              precisión que acepta {targetGame.shortName}. Ajusta el valor
              exacto en el juego si el slider no coincide.
            </p>
          </div>

          <div>
            <div className="field-label">
              <span>DPI de destino</span>
              <span className="mono text-[0.62rem] font-normal text-[var(--faint)]">
                {sameDpi ? "mismo que origen" : "personalizado"}
              </span>
            </div>
            <div className="inline-flex w-full border border-[var(--line-strong)]">
              <button
                type="button"
                onClick={() => setSameDpi(true)}
                aria-pressed={sameDpi}
                className={cn(
                  "flex-1 px-2 py-2 text-[0.72rem] font-semibold transition-colors",
                  sameDpi
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                Usar {dpi || "—"} DPI
              </button>
              <button
                type="button"
                onClick={() => setSameDpi(false)}
                aria-pressed={!sameDpi}
                className={cn(
                  "flex-1 border-l border-[var(--line-strong)] px-2 py-2 text-[0.72rem] font-semibold transition-colors",
                  !sameDpi
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
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

      <div className="border-t border-[var(--ink)] p-4 sm:p-5">
        <fieldset>
          <legend className="flex w-full flex-wrap items-baseline justify-between gap-2">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em]">
              Qué quieres conservar
            </span>
            <span className="hidden text-[0.68rem] text-[var(--faint)] sm:block">
              Los métodos no son intercambiables
            </span>
          </legend>
          <div className="mt-3 grid gap-px bg-[var(--line)] sm:grid-cols-2 xl:grid-cols-4">
            {availability.map(({ method: item, available, reason }) => {
              const checked = activeMethod === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    "group relative flex cursor-pointer flex-col gap-1 p-3 transition-colors",
                    checked
                      ? "bg-[var(--field)]"
                      : "bg-[var(--paper-raise)] hover:bg-[var(--paper)]",
                    !available && "cursor-not-allowed opacity-55",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[0.82rem] font-semibold">
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
                          "grid size-3.5 place-items-center border",
                          checked
                            ? "border-[var(--ink)] bg-[var(--ink)]"
                            : "border-[var(--line-strong)]",
                        )}
                      >
                        {checked ? (
                          <span className="size-1.5 bg-[var(--field)]" />
                        ) : null}
                      </span>
                      {item.name}
                    </span>
                    {item.id === "cm360" ? (
                      <span className="mono text-[0.55rem] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                        base
                      </span>
                    ) : null}
                  </span>
                  <span className="pl-[1.4rem] text-[0.68rem] leading-relaxed text-[var(--ink-soft)]">
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
          <details className="mt-3 border border-[var(--line)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[0.75rem] font-medium text-[var(--ink-soft)]">
              <span className="flex items-center gap-2">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                Ajustes de FOV
              </span>
              <span className="mono text-[0.62rem] text-[var(--faint)]">
                {sourceFov || "—"}° → {targetFov || "—"}°
              </span>
            </summary>
            <div className="grid gap-3 border-t border-[var(--line)] p-3 sm:grid-cols-2">
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

      <dl
        className="grid grid-cols-2 gap-px border-t border-[var(--ink)] bg-[var(--line)] lg:grid-cols-4"
        aria-live="polite"
      >
        <Metric
          label="cm/360 origen"
          value={result ? `${formatMeasure(result.sourceCm360)} cm` : "—"}
        />
        <Metric
          label="cm/360 destino"
          value={result ? `${formatMeasure(result.targetCm360)} cm` : "—"}
        />
        <Metric
          label="eDPI origen"
          value={result ? formatMeasure(result.sourceEdpi, 0) : "—"}
        />
        <Metric
          label="eDPI destino"
          value={result ? formatMeasure(result.targetEdpi, 0) : "—"}
        />
      </dl>

      <div className="border-t border-[var(--line)] px-4 py-3 sm:px-5">
        {result ? (
          <>
            <div className="mono flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.66rem] text-[var(--muted)]">
              <span>
                {formatSensitivity(result.sourceSensitivity, sourceGame.sensitivity.decimals)} sens ×{" "}
                {result.sourceDpi} DPI
              </span>
              <span aria-hidden="true" className="text-[var(--line-strong)]">
                |
              </span>
              <span>
                {formatMeasure(result.sourceDegreesPerCount, 3)}°/count →{" "}
                {formatMeasure(result.targetDegreesPerCount, 3)}°/count
              </span>
              {activeMethod !== "cm360" ? (
                <>
                  <span aria-hidden="true" className="text-[var(--line-strong)]">
                    |
                  </span>
                  <span>
                    FOV {formatMeasure(result.sourceFov ?? 0, 1)}° →{" "}
                    {formatMeasure(result.targetFov ?? 0, 1)}°
                  </span>
                </>
              ) : null}
            </div>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-[var(--faint)]">
              {selectedMethod?.preserves} No conserva:{" "}
              {selectedMethod?.doesNotPreserve.toLowerCase()}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-[var(--danger)]" role="alert">
            {outcome.ok ? "" : outcome.error.message}
          </p>
        )}

        {result && result.warnings.length > 0 ? (
          <ul className="mt-2 grid gap-1.5">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 border border-[rgba(138,90,0,0.4)] bg-[var(--field-soft)] px-2.5 py-2 text-[0.68rem] leading-relaxed text-[var(--ink-soft)]"
              >
                <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {methodDisabled && method !== activeMethod ? (
          <p className="mt-2 text-[0.68rem] text-[var(--warning)]">
            El método seleccionado no está disponible; se muestra distancia 360°.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 border-t border-[var(--ink)] p-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center sm:p-5">
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

        {canSave ? (
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={!result || saving}
          >
            <Save className="size-4" aria-hidden="true" />
            {saving ? "Guardando…" : "Guardar en mi cuenta"}
          </Button>
        ) : (
          <Link href="/login?next=/" className="btn btn-secondary">
            <Lock className="size-4" aria-hidden="true" />
            Entra para guardar perfiles
          </Link>
        )}

        <p className="text-[0.65rem] leading-relaxed text-[var(--faint)] sm:col-span-3">
          La conversión es matemática; la sensación también depende del FOV, el
          zoom, la aceleración y la respuesta del juego.
        </p>

        {saveState ? (
          <p
            role="status"
            className={cn(
              "border px-3 py-2 text-[0.7rem] leading-relaxed sm:col-span-3",
              saveState.status === "ok"
                ? "border-[rgba(11,106,60,0.4)] text-[var(--success)]"
                : "border-[rgba(165,31,24,0.4)] text-[var(--danger)]",
            )}
          >
            {saveState.message}
          </p>
        ) : null}

        {copied === "error" ? (
          <p className="text-[0.7rem] text-[var(--danger)] sm:col-span-3" role="status">
            No se pudo copiar al portapapeles. Revisa los permisos del navegador.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--paper-raise)] px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="mono mt-1 text-[0.95rem] font-bold">{value}</dd>
    </div>
  );
}

function CmScale({ value }: { value: number | null }) {
  const min = 5;
  const max = 65;
  const clamped = value === null ? null : Math.min(Math.max(value, min), max);
  const percent =
    clamped === null ? null : ((clamped - min) / (max - min)) * 100;
  const ticks = Array.from({ length: 13 }, (_, index) => min + index * 5);

  return (
    <div
      className="cm-scale"
      role="img"
      aria-label={
        clamped === null
          ? "Escala de cm/360 sin valor"
          : `Tu cm/360 es ${formatMeasure(clamped)} centímetros en una escala de 5 a 65`
      }
    >
      <span className="cm-scale__track" aria-hidden="true" />
      {ticks.map((tick) => (
        <span
          key={tick}
          className="cm-scale__tick"
          style={{ left: `${((tick - min) / (max - min)) * 100}%` }}
          aria-hidden="true"
        />
      ))}
      {percent !== null ? (
        <span
          className="cm-scale__marker"
          style={{ left: `${percent}%` }}
          aria-hidden="true"
        />
      ) : null}
      <span className="mono absolute bottom-0 left-0 text-[0.55rem] font-medium tracking-[0.06em] text-[var(--ink)]/65">
        {min} cm
      </span>
      <span className="mono absolute bottom-0 right-0 text-[0.55rem] font-medium tracking-[0.06em] text-[var(--ink)]/65">
        {max} cm
      </span>
    </div>
  );
}
