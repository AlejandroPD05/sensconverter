"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Lock, Save } from "lucide-react";
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
      className={cn(
        "border border-[var(--line)] bg-[var(--surface)]",
        isCompact ? "p-4" : "p-4 sm:p-5",
      )}
      aria-labelledby={isCompact ? "global-compact-title" : "global-title"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="label">Referencia física</span>
          <h2
            id={isCompact ? "global-compact-title" : "global-title"}
            className="mt-1 text-lg font-semibold tracking-[-0.02em]"
          >
            Sensibilidad global
          </h2>
          <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">
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
        <div className="result-surface p-4">
          <p className="text-xs font-medium text-[var(--accent-fg)]">
            Sensibilidad para {game.shortName}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <output
              className="mono text-[clamp(2.2rem,6vw,3.2rem)] font-semibold leading-none tracking-[-0.04em]"
              aria-live="polite"
              data-testid="global-sensitivity"
            >
              {calculation
                ? formatSensitivity(calculation.rounded, game.sensitivity.decimals)
                : "—"}
            </output>
            <span className="mono pb-1 text-xs">
              {game.sensitivity.unit ?? "sens"} · {formatMeasure(dpiNumber, 0)} DPI
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 border-t border-[var(--line)]">
            {[
              { angle: 90, label: "90°" },
              { angle: 180, label: "180°" },
              { angle: 360, label: "360°" },
            ].map(({ angle, label }) => (
              <div
                key={angle}
                className="border-r border-[var(--line)] px-2 py-2 last:border-r-0"
              >
                <p className="mono text-xs opacity-70">
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

        <div className="flex flex-col gap-3 border border-[var(--line)] p-4 rounded-lg">
          {!isCompact ? (
            <>
              <p className="text-xs font-semibold text-[var(--fg-soft)]">
                Comparación
              </p>
              {calculation?.currentCm360 !== null &&
              calculation?.currentCm360 !== undefined ? (
                <>
                  <div>
                    <p className="text-xs text-[var(--faint)]">
                      Tu sensibilidad actual equivale a
                    </p>
                    <p className="mono mt-0.5 text-xl font-semibold">
                      {formatMeasure(calculation.currentCm360)} cm/360
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      Math.abs(calculation.deltaPercent ?? 0) < 1
                        ? "text-[var(--success)]"
                        : "text-[var(--fg-soft)]",
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
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Introduce tu sensibilidad actual para ver cuánto se aleja de
                  tu referencia global.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--muted)]">
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
            <p className="text-xs leading-relaxed text-[var(--faint)]">
              {storageState === "local"
                ? "Guardado localmente en este navegador."
                : "Sin cuenta, los cambios solo viven en esta pestaña."}
            </p>
            {saveState ? (
              <p
                role="status"
                className={cn(
                  "border px-2.5 py-1.5 text-xs leading-relaxed",
                  saveState.status === "ok"
                    ? "border-[rgba(11,106,60,0.4)] text-[var(--success)]"
                    : "border-[rgba(165,31,24,0.4)] text-[var(--danger)]",
                )}
              >
                {saveState.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {!isCompact ? (
        <div className="mt-4 overflow-hidden border border-[var(--line-strong)] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-strong)] px-4 py-2.5">
            <h3 className="text-xs font-semibold text-[var(--fg-soft)]">
              Equivalencias a {formatMeasure(cm360Number)} cm/360 ·{" "}
              {formatMeasure(dpiNumber, 0)} DPI
            </h3>
            <span className="mono text-xs text-[var(--faint)]">
              cadera
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Juego</th>
                  <th scope="col">Sensibilidad</th>
                  <th scope="col" className="hidden sm:table-cell">
                    eDPI
                  </th>
                  <th scope="col">Estado</th>
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
                        entry.id === gameId && "bg-[var(--accent-soft)]",
                      )}
                    >
                      <td className="font-semibold">{entry.shortName}</td>
                      <td className="mono text-[0.8125rem] font-semibold">
                        {formatSensitivity(value, entry.sensitivity.decimals)}
                      </td>
                      <td className="mono hidden text-[0.8125rem] text-[var(--muted)] sm:table-cell">
                        {formatMeasure(dpiNumber * value, 0)}
                      </td>
                      <td>
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
