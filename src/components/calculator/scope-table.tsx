import { ExternalLink } from "lucide-react";
import type { ConversionMethodId } from "@/lib/conversion/engine";
import type { MonitorAxis } from "@/lib/conversion/fov";
import { zoomRecommendations } from "@/lib/conversion/zoom";
import type { GameDefinition } from "@/lib/games/types";
import { formatMeasure } from "@/lib/format";

interface ScopeTableProps {
  game: GameDefinition;
  hipFov: number;
  aspectRatio: number;
  method: ConversionMethodId;
  monitorDistance: number;
  monitorAxis: MonitorAxis;
}

function matchLabel(method: ConversionMethodId, distance: number, axis: MonitorAxis) {
  if (method === "fov-aware") return "focal length (0%)";
  if (method === "monitor-distance") {
    return `${formatMeasure(distance * 100, 0)}% de distancia de monitor ${
      axis === "vertical" ? "vertical" : "horizontal"
    }`;
  }
  return "la misma distancia 360°";
}

/** Recommended zoom setting for each scope of the target game. */
export function ScopeTable({
  game,
  hipFov,
  aspectRatio,
  method,
  monitorDistance,
  monitorAxis,
}: ScopeTableProps) {
  const zoom = game.zoom;

  if (!zoom) {
    return (
      <p className="mt-3 text-xs leading-relaxed text-[var(--faint)]" data-testid="scope-gap">
        Miras de {game.shortName}: no hay una fuente pública que explique cómo
        escala su sensibilidad con zoom o ADS, así que no damos ningún valor.
      </p>
    );
  }

  const match = method === "fov-aware" || method === "monitor-distance" ? "monitor" : "cm360";
  const rows = zoomRecommendations({
    game,
    hipFov,
    aspectRatio,
    match,
    monitorDistance: method === "fov-aware" ? 0 : monitorDistance,
    monitorAxis,
  });

  return (
    <section
      className="mt-3 rounded-lg border border-[var(--line)]"
      aria-labelledby="scope-title"
      data-testid="scope-table"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2.5">
        <h3 id="scope-title" className="text-xs font-medium text-[var(--fg-soft)]">
          Miras de {game.shortName} · iguala {matchLabel(method, monitorDistance, monitorAxis)}
        </h3>
        <span
          className={
            zoom.verification === "verified" ? "badge badge-success" : "badge badge-warning"
          }
        >
          {zoom.verification === "verified" ? "Verificado" : "Experimental"}
        </span>
      </div>
      {rows ? (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Mira</th>
              <th scope="col">FOV con zoom</th>
              <th scope="col" className="text-right">
                <code className="mono">{zoom.settingName}</code>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.level.id}>
                <td className="text-sm">{row.level.name}</td>
                <td className="mono text-xs text-[var(--muted)]">{row.level.fov}</td>
                <td className="mono text-right text-sm font-semibold">
                  {row.settingRounded.toFixed(zoom.decimals)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="px-3 py-2.5 text-xs text-[var(--danger)]" role="alert">
          Revisa el FOV y la distancia de monitor: con estos valores no se puede
          calcular la mira.
        </p>
      )}
      <p className="border-t border-[var(--line)] px-3 py-2.5 text-xs leading-relaxed text-[var(--faint)]">
        {zoom.note} Valor por defecto del juego: {zoom.settingDefault}.{" "}
        <a
          href={zoom.source.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-[var(--accent)] hover:underline"
        >
          Fuente
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </p>
    </section>
  );
}
