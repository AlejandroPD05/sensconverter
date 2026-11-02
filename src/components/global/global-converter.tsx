"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Gauge, Lock, Save, Sparkles } from "lucide-react";
import { GameSelect } from "@/components/games/game-select";
import { NumberField } from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";
import {
  cm360For,
  sensitivityForCm360,
} from "@/lib/conversion/engine";
import {
  getConvertibleGames,
  getGame,
} from "@/lib/games/registry";
import { formatMeasure, formatSensitivity, parseDecimal } from "@/lib/format";
import {
  getGlobalServerSnapshot,
  getGlobalSnapshot,
  parseStoredGlobal,
  persistGlobal,
  subscribeGlobal,
} from "@/lib/global-preference";
import { saveGlobalPreference } from "@/app/actions";
import { cn } from "@/lib/cn";

const convertibleGames = getConvertibleGames();

interface GlobalConverterProps {
  canSave: boolean;
  initialCm360?: number;
  initialDpi?: number;
  variant?: "compact" | "full";
}

function shortestAngle(cm360: number, angle: number) {
  return (cm360 * angle) / 360;
}

export function GlobalConverter({
  canSave,
  initialCm360,
  initialDpi,
  variant = "full",
}: GlobalConverterProps) {
  const [draft, setDraft] = useState<{
    cm360?: string;
    dpi?: string;
    gameId?: string;
  }>({});
  const [currentSens, setCurrentSens] = useState("");
  const storedRaw = useSyncExternalStore(
    subscribeGlobal,
    getGlobalSnapshot,
    getGlobalServerSnapshot,
  );
  const stored = parseStoredGlobal(storedRaw);
  const cm360 =
    draft.cm360 ??
    (initialCm360 !== undefined
      ? String(initialCm360)
      : stored?.cm360 !== undefined
        ? String(stored.cm360)
        : "40");
  const dpi =
    draft.dpi ??
    (initialDpi !== undefined
      ? String(initialDpi)
      : stored?.dpi !== undefined
        ? String(stored.dpi)
        : "800");
  const gameId =
    draft.gameId ??
    (stored?.gameId && getGame(stored.gameId)?.yaw ? stored.gameId : "valorant");
  const storageState = stored ? "local" : "none";
  const [saveState, setSaveState] = useState<{
    status: "ok" | "error";
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  function persist(next: { cm360: string; dpi: string; gameId: string }) {
    const cmValue = parseDecimal(next.cm360);
    const dpiValue = parseDecimal(next.dpi);
    if (
      !Number.isFinite(cmValue) ||
      cmValue <= 0 ||
      !Number.isFinite(dpiValue) ||
      dpiValue <= 0
    ) {
      return;
    }
    persistGlobal({ cm360: cmValue, dpi: dpiValue, gameId: next.gameId });
  }

  function selectCm360(value: string) {
    setDraft((previous) => ({ ...previous, cm360: value }));
    persist({ cm360: value, dpi, gameId });
  }

  function selectDpi(value: string) {
    setDraft((previous) => ({ ...previous, dpi: value }));
    persist({ cm360, dpi: value, gameId });
  }

  function selectGame(value: string) {
    setDraft((previous) => ({ ...previous, gameId: value }));
    persist({ cm360, dpi, gameId: value });
  }

  const game = getGame(gameId) ?? convertibleGames[0];
  const cm360Number = parseDecimal(cm360);
  const dpiNumber = parseDecimal(dpi);
  const currentSensNumber = parseDecimal(currentSens);

  const calculation =
    game.yaw &&
    Number.isFinite(cm360Number) &&
    cm360Number > 0 &&
    Number.isFinite(dpiNumber) &&
    dpiNumber > 0
      ? (() => {
          const sensitivity = sensitivityForCm360(
            dpiNumber,
            cm360Number,
            game.yaw,
          );
          const factor = Math.pow(10, game.sensitivity.decimals);
          const rounded = Math.round(sensitivity * factor) / factor;
          const currentCm360 =
            Number.isFinite(currentSensNumber) && currentSensNumber > 0
              ? cm360For(dpiNumber, currentSensNumber, game.yaw)
              : null;
          const deltaPercent =
            currentCm360 !== null
              ? ((currentCm360 - cm360Number) / cm360Number) * 100
              : null;
          return { sensitivity, rounded, currentCm360, deltaPercent };
        })()
      : null;

  async function handleSave() {
    if (!calculation) return;
    setSaving(true);
    setSaveState(null);
    const response = await saveGlobalPreference({
      cm360: cm360Number,
      dpi: dpiNumber,
    });
    setSaving(false);
    setSaveState({
      status: response.ok ? "ok" : "error",
      message: response.message,
    });
  }

  const isCompact = variant === "compact";

  return (
    <section
      className={cn("glass p-4 sm:p-5", isCompact && "p-4")}
      aria-labelledby={isCompact ? "global-compact-title" : "global-title"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">
            {isCompact ? (
              <Gauge className="size-3.5" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3.5" aria-hidden="true" />
            )}
            Referencia física
          </p>
          <h2
            id={isCompact ? "global-compact-title" : "global-title"}
            className="mt-1 text-lg font-semibold tracking-[-0.02em]"
          >
            Sensibilidad global
          </h2>
          <p className="mt-1 max-w-xl text-[0.78rem] leading-relaxed text-[var(--muted)]">
            Elige cuántos centímetros quieres mover el ratón para girar 360°.
            Después calcula la sensibilidad equivalente en cada juego.
          </p>
        </div>
        <span className="badge badge-accent">cm/360 físico</span>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3",
          isCompact
            ? "sm:grid-cols-3"
            : "sm:grid-cols-2 xl:grid-cols-4",
        )}
      >
        <NumberField
          label="Objetivo cm/360"
          value={cm360}
          onChange={selectCm360}
          unit="cm"
          step={1}
          min={1}
          hint="Distancia de ratón para un giro completo."
        />
        <NumberField
          label="DPI del ratón"
          value={dpi}
          onChange={selectDpi}
          unit="DPI"
          step={1}
          min={1}
          max={32000}
        />
        <div className={isCompact ? "sm:col-span-1" : "sm:col-span-1"}>
          <GameSelect
            label="Juego"
            games={convertibleGames}
            value={gameId}
            onChange={selectGame}
          />
        </div>
        {!isCompact ? (
          <NumberField
            label="Tu sensibilidad actual (opcional)"
            value={currentSens}
            onChange={setCurrentSens}
            unit={game.sensitivity.unit ?? "sens"}
            step={game.sensitivity.step}
            min={0}
            hint={`Para comparar con ${game.shortName}.`}
          />
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        <div className="result-surface rounded-[var(--radius-md)] p-4">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[var(--accent)]/80">
            Sensibilidad para {game.shortName}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <output
              className="mono text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-none tracking-[-0.05em]"
              aria-live="polite"
              data-testid="global-sensitivity"
            >
              {calculation
                ? formatSensitivity(calculation.rounded, game.sensitivity.decimals)
                : "—"}
            </output>
            <span className="pb-1 text-[0.68rem] text-[var(--faint)]">
              {game.sensitivity.unit ?? "sens"} · {formatMeasure(dpiNumber, 0)} DPI
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { angle: 90, label: "90°" },
              { angle: 180, label: "180°" },
              { angle: 360, label: "360°" },
            ].map(({ angle, label }) => (
              <div
                key={angle}
                className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-2 text-center"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[var(--faint)]">
                  {label}
                </p>
                <p className="mono mt-0.5 text-sm font-semibold">
                  {Number.isFinite(cm360Number)
                    ? `${formatMeasure(shortestAngle(cm360Number, angle), 1)} cm`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-inset flex flex-col gap-3 p-4">
          {!isCompact ? (
            <>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
                Comparación
              </p>
              {calculation?.currentCm360 !== null &&
              calculation?.currentCm360 !== undefined ? (
                <>
                  <div>
                    <p className="text-[0.65rem] text-[var(--faint)]">
                      Tu sensibilidad actual equivale a
                    </p>
                    <p className="mono mt-0.5 text-xl font-semibold">
                      {formatMeasure(calculation.currentCm360)} cm/360
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-[0.72rem] leading-relaxed",
                      Math.abs(calculation.deltaPercent ?? 0) < 1
                        ? "text-[var(--success)]"
                        : "text-[var(--text-soft)]",
                    )}
                  >
                    {Math.abs(calculation.deltaPercent ?? 0) < 1
                      ? "Prácticamente igual a tu objetivo global."
                      : `${Math.abs(calculation.deltaPercent ?? 0).toFixed(1)}% ${
                          (calculation.deltaPercent ?? 0) > 0 ? "más lenta" : "más rápida"
                        } que tu objetivo global.`}
                  </p>
                </>
              ) : (
                <p className="text-[0.72rem] leading-relaxed text-[var(--muted)]">
                  Introduce tu sensibilidad actual para ver cuánto se aleja de
                  tu referencia global.
                </p>
              )}
            </>
          ) : (
            <p className="text-[0.72rem] leading-relaxed text-[var(--muted)]">
              Un mismo cm/360 produce números distintos en cada juego. Es una
              referencia física, no una sensibilidad universal.
            </p>
          )}

          <div className="mt-auto space-y-2">
            {canSave ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleSave}
                disabled={!calculation || saving}
              >
                <Save className="size-4" aria-hidden="true" />
                {saving ? "Guardando…" : "Guardar preferencia"}
              </Button>
            ) : (
              <Link href="/login?next=/global" className="btn btn-secondary w-full">
                <Lock className="size-4" aria-hidden="true" />
                Entra para sincronizarla
              </Link>
            )}
            <p className="text-[0.62rem] leading-relaxed text-[var(--faint)]">
              {storageState === "local"
                ? "Guardado localmente en este navegador."
                : "Sin cuenta, los cambios solo viven en esta pestaña."}
            </p>
            {saveState ? (
              <p
                role="status"
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-[0.65rem] leading-relaxed",
                  saveState.status === "ok"
                    ? "border-[var(--success)]/25 bg-[var(--success)]/[0.06] text-[#a7f3d0]"
                    : "border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] text-[#fecdd3]",
                )}
              >
                {saveState.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {!isCompact ? (
        <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
              Equivalencias a {formatMeasure(cm360Number)} cm/360 · {formatMeasure(dpiNumber, 0)} DPI
            </h3>
            <span className="text-[0.62rem] text-[var(--faint)]">cadera</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[0.78rem]">
              <thead>
                <tr className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--faint)]">
                  <th className="px-4 py-2 font-medium">Juego</th>
                  <th className="px-4 py-2 font-medium">Sensibilidad</th>
                  <th className="px-4 py-2 font-medium">eDPI</th>
                  <th className="px-4 py-2 font-medium">cm/360</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {convertibleGames.map((entry) => {
                  if (!entry.yaw || !Number.isFinite(cm360Number) || cm360Number <= 0) {
                    return null;
                  }
                  const value = sensitivityForCm360(dpiNumber, cm360Number, entry.yaw);
                  return (
                    <tr
                      key={entry.id}
                      className={cn(
                        "border-t border-white/[0.05]",
                        entry.id === gameId && "bg-[var(--accent)]/[0.04]",
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium">{entry.shortName}</td>
                      <td className="mono px-4 py-2.5 text-[var(--accent)]">
                        {formatSensitivity(value, entry.sensitivity.decimals)}
                      </td>
                      <td className="mono px-4 py-2.5 text-[var(--muted)]">
                        {formatMeasure(dpiNumber * value, 0)}
                      </td>
                      <td className="mono px-4 py-2.5 text-[var(--muted)]">
                        {formatMeasure(cm360Number, 1)} cm
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "badge",
                            entry.verification === "verified"
                              ? "badge-success"
                              : "badge-warning",
                          )}
                        >
                          {entry.verification === "verified" ? "Verificado" : "Experimental"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
