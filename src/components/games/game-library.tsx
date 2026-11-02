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
      <div className="glass flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="glass-inset flex flex-1 items-center gap-2 px-3 py-2">
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
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por estado">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.7rem] font-medium transition-colors",
                filter === item.id
                  ? "border-[var(--line-accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-white/[0.08] text-[var(--muted)] hover:border-white/20 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[0.72rem] text-[var(--faint)]" role="status">
        {filtered.length} {filtered.length === 1 ? "juego" : "juegos"} · solo se
        convierten los que tienen una constante documentada
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((game) => {
          const convertible = Boolean(game.yaw) && game.verification !== "pending";
          return (
            <article
              key={game.id}
              className="glass group flex min-w-0 flex-col p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl border text-[0.72rem] font-bold",
                    convertible
                      ? "border-[var(--line-accent)] bg-[var(--accent)]/[0.08] text-[var(--accent)]"
                      : "border-white/[0.08] bg-white/[0.03] text-[var(--faint)]",
                  )}
                  aria-hidden="true"
                >
                  {initials(game)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[0.95rem] font-semibold tracking-[-0.01em]">
                    {game.name}
                  </h2>
                  <p className="truncate text-[0.68rem] text-[var(--faint)]">
                    {game.developer}
                    {game.releaseYear ? ` · ${game.releaseYear}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "badge shrink-0",
                    game.verification === "verified" && "badge-success",
                    game.verification === "experimental" && "badge-warning",
                    game.verification === "pending" && "badge",
                  )}
                >
                  {game.verification === "verified" ? (
                    <ShieldCheck className="size-3" aria-hidden="true" />
                  ) : game.verification === "experimental" ? (
                    <TriangleAlert className="size-3" aria-hidden="true" />
                  ) : null}
                  {statusLabels[game.verification]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {game.capabilities.length > 0 ? (
                  game.capabilities.map((capability) => (
                    <span key={capability} className="badge text-[0.6rem]">
                      {capabilityLabels[capability]}
                    </span>
                  ))
                ) : (
                  <span className="badge text-[0.6rem]">Conversión no disponible</span>
                )}
              </div>

              <p className="mt-3 line-clamp-2 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                {game.notes[0]}
              </p>

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                {convertible ? (
                  <Link
                    href={`/?game=${encodeURIComponent(game.id)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Usar en la calculadora
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href="/methodology#limites"
                    className="text-[0.7rem] font-medium text-[var(--warning)] underline-offset-4 hover:underline"
                  >
                    Por qué no está disponible
                  </Link>
                )}
                {game.lastVerified ? (
                  <span className="text-[0.6rem] text-[var(--faint)]">
                    Verificado {game.lastVerified}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-3 p-10 text-center">
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
