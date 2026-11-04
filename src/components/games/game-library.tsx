"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowUpRight, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { games } from "@/lib/games/registry";
import type {
  ConversionCapability,
  GameDefinition,
  VerificationStatus,
} from "@/lib/games/types";
import { cn } from "@/lib/cn";

type Filter = "all" | VerificationStatus;

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "verified", label: "Verificados" },
  { id: "experimental", label: "Experimentales" },
  { id: "pending", label: "Pendientes" },
];

const capabilityLabels: Record<ConversionCapability, string> = {
  cm360: "cm/360",
  sensToSens: "Sens → sens",
  fovAware: "FOV aware",
  monitorDistance: "Monitor",
  scoped: "Zoom",
  ads: "ADS",
};

const statusLabels: Record<VerificationStatus, string> = {
  verified: "Verificado",
  experimental: "Experimental",
  pending: "Sin verificar",
  unsupported: "No soportado",
};

function initials(game: GameDefinition) {
  return game.shortName
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function GameLibrary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return games.filter((game) => {
      const matchesFilter = filter === "all" || game.verification === filter;
      if (!matchesFilter) return false;
      if (!normalized) return true;
      return [game.name, game.shortName, game.developer, ...game.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [deferredQuery, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:p-4 rounded-lg">
        <div className="flex flex-1 items-center gap-2 border border-[var(--line-strong)] bg-[var(--bg-subtle)] px-3 py-2 rounded-lg">
          <Search className="size-4 shrink-0 text-[var(--faint)]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por juego, estudio o nota…"
            aria-label="Buscar juegos"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--faint)]"
          />
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-lg bg-[var(--surface-muted)] p-1"
          role="group"
          aria-label="Filtrar por estado"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === item.id
                  ? "bg-[var(--surface)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--faint)]" role="status">
        {filtered.length} {filtered.length === 1 ? "juego" : "juegos"} · solo se
        convierten los que tienen una constante documentada
      </p>

      <div className="mt-3 border border-[var(--line-strong)] rounded-lg">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-4 border-b border-[var(--line)] px-4 py-2 md:grid">
          <span className="label">Juego</span>
          <span className="label">Capacidades</span>
          <span className="label text-right">Estado y acción</span>
        </div>

        <ul>
          {filtered.map((game) => {
            const convertible = Boolean(game.yaw) && game.verification !== "pending";
            return (
              <li
                key={game.id}
                className="grid gap-3 border-b border-[var(--line)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mono grid size-9 shrink-0 place-items-center border text-xs font-semibold",
                      convertible
                        ? "border-[var(--line)] bg-[var(--accent-soft)] text-[var(--fg)]"
                        : "border-[var(--line-strong)] bg-[var(--surface-muted)] text-[var(--faint)]",
                    )}
                    aria-hidden="true"
                  >
                    {initials(game)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[0.95rem] font-semibold tracking-[-0.01em]">
                      {game.name}
                    </h2>
                    <p className="truncate text-xs text-[var(--faint)]">
                      {game.developer}
                      {game.releaseYear ? ` · ${game.releaseYear}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)] md:hidden">
                      {game.notes[0]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {game.capabilities.length > 0 ? (
                    game.capabilities.map((capability) => (
                      <span key={capability} className="badge text-xs before:hidden">
                        {capabilityLabels[capability]}
                      </span>
                    ))
                  ) : (
                    <span className="badge text-xs">Sin conversión</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                  <span
                    className={cn(
                      "badge",
                      game.verification === "verified" && "badge-success",
                      game.verification === "experimental" && "badge-warning",
                    )}
                  >
                    {game.verification === "verified" ? (
                      <ShieldCheck className="size-2.5" aria-hidden="true" />
                    ) : game.verification === "experimental" ? (
                      <TriangleAlert className="size-2.5" aria-hidden="true" />
                    ) : null}
                    {statusLabels[game.verification]}
                  </span>
                  {convertible ? (
                    <Link
                      href={`/?game=${encodeURIComponent(game.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      Usar en la calculadora
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      href="/methodology#limites"
                      className="text-xs font-medium text-[var(--warning)] underline underline-offset-4"
                    >
                      Por qué no está disponible
                    </Link>
                  )}
                </div>

                <p className="hidden text-xs leading-relaxed text-[var(--muted)] md:col-span-3 md:block">
                  {game.notes[0]}
                  {game.lastVerified ? (
                    <span className="mono ml-1 text-xs text-[var(--faint)]">
                      · verificado {game.lastVerified}
                    </span>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-3 border border-[var(--line-strong)] bg-[var(--surface)] p-10 text-center rounded-lg">
          <p className="text-sm text-[var(--muted)]">
            No hay juegos que coincidan con «{deferredQuery}».
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-4"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}
    </div>
  );
}
