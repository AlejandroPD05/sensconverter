"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
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
import { saveCalculatorProfile } from "@/app/actions";
import { aspectFromResolution, type MonitorAxis } from "@/lib/conversion/fov";
import { ScopeTable } from "./scope-table";
import { ScreenFields } from "./screen-fields";
import { RollingNumber } from "@/components/ui/rolling-number";

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
  const [monitorAxis, setMonitorAxis] = useState<MonitorAxis>("horizontal");
  const [sourceWidth, setSourceWidth] = useState("1920");
  const [sourceHeight, setSourceHeight] = useState("1080");
  const [targetWidth, setTargetWidth] = useState("1920");
  const [targetHeight, setTargetHeight] = useState("1080");
  const sourceAspect = aspectFromResolution(parseDecimal(sourceWidth), parseDecimal(sourceHeight));
  const targetAspect = aspectFromResolution(parseDecimal(targetWidth), parseDecimal(targetHeight));
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
    monitorAxis,
    sourceAspectRatio: sourceAspect,
    targetAspectRatio: targetAspect,
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
    setSourceFov(targetFov);
    setTargetFov(sourceFov);
    setSourceWidth(targetWidth);
    setSourceHeight(targetHeight);
    setTargetWidth(sourceWidth);
    setTargetHeight(sourceHeight);
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
    setMonitorAxis("horizontal");
    setSourceWidth("1920");
    setSourceHeight("1080");
    setTargetWidth("1920");
    setTargetHeight("1080");
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
      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)]"
      aria-labelledby="calculator-title"
      data-testid="calculator"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2
            id="calculator-title"
            className="text-[0.95rem] font-semibold"
          >
            Conversión
          </h2>
          <span className="text-xs text-[var(--faint)]">
            Se recalcula al escribir
          </span>
        </div>
        <span className="badge badge-accent">
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

          <ScreenFields
            game={sourceGame}
            width={sourceWidth}
            height={sourceHeight}
            fov={sourceFov}
            onWidthChange={setSourceWidth}
            onHeightChange={setSourceHeight}
            onFovChange={setSourceFov}
            fovError={fieldError("fov")}
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
              <p className="text-xs font-medium text-[var(--accent-fg)]">
                Sensibilidad recomendada
              </p>
              <span className="text-xs text-[var(--accent-fg)]">
                {targetGame.sensitivity.unit ?? "sens"}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <output
                className="mono block text-[clamp(2.5rem,6.5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-[var(--fg)]"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="sr-only" data-testid="target-sensitivity">
                  {resultValue}
                </span>
                <RollingNumber value={resultValue} />
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

            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Redondeado a {targetGame.sensitivity.decimals} decimales, la
              precisión que acepta {targetGame.shortName}. Ajusta el valor
              exacto en el juego si el slider no coincide.
            </p>
          </div>

          <div>
            <div className="field-label">
              <span>DPI de destino</span>
              <span className="text-xs font-normal text-[var(--faint)]">
                {sameDpi ? "mismo que origen" : "personalizado"}
              </span>
            </div>
            <div
              className="segmented"
              style={{ "--seg-index": sameDpi ? 0 : 1 } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => setSameDpi(true)}
                aria-pressed={sameDpi}
              >
                Usar {dpi || "—"} DPI
              </button>
              <button
                type="button"
                onClick={() => setSameDpi(false)}
                aria-pressed={!sameDpi}
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

          <ScreenFields
            game={targetGame}
            width={targetWidth}
            height={targetHeight}
            fov={targetFov}
            onWidthChange={setTargetWidth}
            onHeightChange={setTargetHeight}
            onFovChange={setTargetFov}
          />
        </div>
      </div>

      <div className="border-t border-[var(--line)] p-4 sm:p-5">
        <fieldset>
          <legend className="flex w-full flex-wrap items-baseline justify-between gap-2">
            <span className="text-[0.9rem] font-semibold">
              Qué quieres conservar
            </span>
            <span className="hidden text-xs text-[var(--faint)] sm:block">
              Los métodos no son intercambiables
            </span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {availability.map(({ method: item, available, reason }) => {
              const checked = activeMethod === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    "group relative flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent)]",
                    checked
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]",
                    !available && "cursor-not-allowed opacity-55",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[0.8125rem] font-semibold">
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
                          "grid size-4 place-items-center rounded-full border",
                          checked
                            ? "border-[var(--accent)] bg-[var(--accent)]"
                            : "border-[var(--line-strong)]",
                        )}
                      >
                        {checked ? (
                          <span className="size-1.5 rounded-full bg-[var(--on-accent)]" />
                        ) : null}
                      </span>
                      {item.name}
                    </span>
                    {item.id === "cm360" ? (
                      <span className="badge text-[0.65rem] before:hidden">
                        base
                      </span>
                    ) : null}
                  </span>
                  <span className="pl-6 text-xs leading-relaxed text-[var(--fg-soft)]">
                    {item.shortDescription}
                  </span>
                  {!available ? (
                    <span className="pl-6 text-xs leading-relaxed text-[var(--faint)]">
                      {reason}
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        {activeMethod === "monitor-distance" ? (
          <div className="mt-3 grid gap-3 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-2">
            <div>
              <span className="field-label" id="monitor-axis-label">
                Medir la distancia en
              </span>
              <div
                className="segmented"
                role="group"
                aria-labelledby="monitor-axis-label"
                style={{ "--seg-index": monitorAxis === "vertical" ? 1 : 0 } as CSSProperties}
              >
                {(["horizontal", "vertical"] as const).map((axis) => (
                  <button
                    key={axis}
                    type="button"
                    onClick={() => setMonitorAxis(axis)}
                    aria-pressed={monitorAxis === axis}
                    className="capitalize"
                  >
                    {axis}
                  </button>
                ))}
              </div>
              <p className="field-hint">Vertical no depende del ancho del monitor.</p>
            </div>
            <NumberField
              label="Distancia de monitor"
              value={monitorDistance}
              onChange={setMonitorDistance}
              unit="%"
              step={5}
              min={0}
              max={100}
              error={fieldError("monitorDistance")}
              hint="Desde el centro: 0% es focal length y 100% el borde."
            />
          </div>
        ) : null}

        <ScopeTable
          game={targetGame}
          hipFov={parseDecimal(targetFov)}
          aspectRatio={targetAspect}
          method={activeMethod}
          monitorDistance={monitorFraction}
          monitorAxis={monitorAxis}
        />
      </div>

      <dl
        className="grid grid-cols-2 gap-px border-t border-[var(--line)] bg-[var(--line)] lg:grid-cols-4"
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
            <div className="mono flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
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
            <p className="mt-2 text-xs leading-relaxed text-[var(--faint)]">
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
                className="flex items-start gap-2 rounded-md border border-[var(--warning-line)] bg-[var(--warning-soft)] px-2.5 py-2 text-xs leading-relaxed text-[var(--fg-soft)]"
              >
                <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {methodDisabled && method !== activeMethod ? (
          <p className="mt-2 text-xs text-[var(--warning)]">
            El método seleccionado no está disponible; se muestra distancia 360°.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 border-t border-[var(--line)] p-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center sm:p-5">
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

        <p className="text-xs leading-relaxed text-[var(--faint)] sm:col-span-3">
          La conversión es matemática; la sensación también depende del FOV, el
          zoom, la aceleración y la respuesta del juego.
        </p>

        {saveState ? (
          <p
            role="status"
            className={cn(
              "rounded-md border px-3 py-2 text-xs leading-relaxed sm:col-span-3",
              saveState.status === "ok"
                ? "border-[var(--success-line)] bg-[var(--success-soft)] text-[var(--success)]"
                : "border-[var(--danger-line)] bg-[var(--danger-soft)] text-[var(--danger)]",
            )}
          >
            {saveState.message}
          </p>
        ) : null}

        {copied === "error" ? (
          <p className="text-xs text-[var(--danger)] sm:col-span-3" role="status">
            No se pudo copiar al portapapeles. Revisa los permisos del navegador.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface)] px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="mono mt-1 text-[1.05rem] font-semibold">{value}</dd>
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
      <span className="mono absolute bottom-0 left-0 text-xs text-[var(--accent-fg)]">
        {min} cm
      </span>
      <span className="mono absolute bottom-0 right-0 text-xs text-[var(--accent-fg)]">
        {max} cm
      </span>
    </div>
  );
}
