"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { GameDefinition } from "@/lib/games/types";
import { cn } from "@/lib/cn";

interface GameSelectProps {
  label: string;
  games: GameDefinition[];
  value: string;
  onChange: (gameId: string) => void;
  hint?: string;
  excludeId?: string;
}

function initials(name: string): string {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function GameSelect({
  label,
  games,
  value,
  onChange,
  hint,
  excludeId,
}: GameSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = games.find((game) => game.id === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const available = games.filter((game) => game.id !== excludeId);
    if (!normalized) return available;
    return available.filter((game) =>
      [game.name, game.shortName, game.developer, game.id]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [games, query, excludeId]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openSelect() {
    setQuery("");
    setActiveIndex(
      Math.max(0, filtered.findIndex((game) => game.id === value)),
    );
    setOpen(true);
  }

  function closeSelect(returnFocus = true) {
    setOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function selectGame(game: GameDefinition) {
    onChange(game.id);
    closeSelect();
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(Math.max(filtered.length - 1, 0), index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const game = filtered[activeIndex];
      if (game) selectGame(game);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeSelect();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const listId = `${id}-listbox`;
  const labelId = `${id}-label`;

  return (
    <div ref={rootRef} className="relative">
      <div className="field-label">
        <span id={labelId}>{label}</span>
        {selected ? (
          <span className="mono text-xs font-normal tracking-normal text-[var(--faint)]">
            yaw {selected.yaw}
          </span>
        ) : null}
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="flex w-full items-center gap-3 border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2.5 text-left transition-colors hover:border-[var(--faint)] rounded-lg"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        onClick={() => (open ? closeSelect(false) : openSelect())}
      >
        <span className="mono grid size-8 shrink-0 place-items-center border border-[var(--line)] bg-[var(--surface-muted)] text-xs font-semibold tracking-wide text-[var(--fg-soft)] rounded-lg">
          {selected ? initials(selected.shortName) : "—"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.92rem] font-semibold text-[var(--text)]">
            {selected?.name ?? "Selecciona un juego"}
          </span>
          <span className="block truncate text-xs text-[var(--faint)]">
            {selected
              ? selected.verification === "experimental"
                ? `${selected.developer} · experimental`
                : `${selected.developer} · ${selected.platforms.includes("console") ? "PC y consola" : "PC"}`
              : "Busca entre los juegos compatibles"}
          </span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-[var(--faint)]"
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden border border-[var(--line)] bg-[var(--surface)] rounded-lg">
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-2.5 py-2">
            <Search className="size-4 shrink-0 text-[var(--faint)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                filtered[activeIndex] ? `${id}-option-${filtered[activeIndex].id}` : undefined
              }
              aria-label={`Buscar ${label.toLowerCase()}`}
              placeholder="Buscar juego o estudio…"
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-72 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                No hay juegos que coincidan con “{query}”.
              </li>
            ) : (
              filtered.map((game, index) => {
                const isSelected = game.id === value;
                return (
                  <li key={game.id}>
                    <button
                      id={`${id}-option-${game.id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-index={index}
                      className={cn(
                        "flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors",
                        index === activeIndex
                          ? "bg-[var(--surface-muted)]"
                          : "hover:bg-[var(--surface-muted)]",
                      )}
                      onPointerMove={() => setActiveIndex(index)}
                      onClick={() => selectGame(game)}
                    >
                      <span className="mono grid size-7 shrink-0 place-items-center border border-[var(--line)] bg-[var(--surface-muted)] text-xs font-semibold text-[var(--fg-soft)] rounded-lg">
                        {initials(game.shortName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {game.name}
                        </span>
                        <span className="block truncate text-xs text-[var(--faint)]">
                          {game.developer}
                          {game.verification === "experimental"
                            ? " · experimental"
                            : ""}
                        </span>
                      </span>
                      {isSelected ? (
                        <Check
                          className="size-4 shrink-0 text-[var(--accent)]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {hint ? <p className="px-2.5 py-2 text-xs text-[var(--faint)]">{hint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
