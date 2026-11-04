"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/ui/number-field";
import {
  deleteSensitivityProfile,
  duplicateSensitivityProfile,
  setPreferredSensitivityProfile,
  setProfileFavorite,
  updateSensitivityProfile,
} from "@/app/actions";
import { formatMeasure, formatSensitivity, parseDecimal } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface SavedProfileView {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  gameShortName: string;
  dpi: number;
  sensitivity: number;
  sensitivityDecimals: number;
  sensitivityUnit?: string;
  method: string;
  cm360: number | null;
  notes: string | null;
  isFavorite: boolean;
  isPreferred: boolean;
  updatedAt: string;
}

const methodLabels: Record<string, string> = {
  cm360: "Distancia 360°",
  "fov-aware": "Focal length (0%)",
  "monitor-distance": "Distancia de monitor",
  "game-specific": "Específica del juego",
};

export function SavedProfiles({ profiles }: { profiles: SavedProfileView[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (onlyFavorites && !profile.isFavorite) return false;
      if (!normalized) return true;
      return [profile.name, profile.gameName, profile.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [profiles, query, onlyFavorites]);

  async function run(
    id: string,
    action: () => Promise<{ ok: boolean; message: string }>,
    closeEditor = false,
  ) {
    setBusyId(id);
    setMessage(null);
    const response = await action();
    setBusyId(null);
    setMessage({ ok: response.ok, text: response.message });
    if (response.ok) {
      if (closeEditor) setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(profile: SavedProfileView) {
    const confirmed = window.confirm(
      `¿Eliminar el perfil «${profile.name}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    await run(profile.id, () => deleteSensitivityProfile(profile.id));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center rounded-lg">
        <div className="flex flex-1 items-center gap-2 border border-[var(--line-strong)] bg-[var(--bg-subtle)] px-3 py-2 rounded-lg">
          <Search className="size-4 shrink-0 text-[var(--faint)]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, juego o nota…"
            aria-label="Buscar perfiles guardados"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--faint)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyFavorites((value) => !value)}
            aria-pressed={onlyFavorites}
            className={cn(
              "btn btn-sm",
              onlyFavorites ? "btn-primary" : "btn-secondary",
            )}
          >
            <Star
              className="size-3.5"
              aria-hidden="true"
              fill={onlyFavorites ? "currentColor" : "none"}
            />
            Favoritos
          </button>
          <Link href="/" className="btn btn-secondary btn-sm">
            <Plus className="size-3.5" aria-hidden="true" />
            Nuevo
          </Link>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-3 border px-3 py-2 text-xs",
            message.ok
              ? "callout callout-success text-[var(--success)]"
              : "callout callout-danger text-[var(--danger)]",
          )}
        >
          {message.text}
        </p>
      ) : null}

      <p
        className="mono mt-3 text-xs text-[var(--faint)]"
        role="status"
      >
        {filtered.length} {filtered.length === 1 ? "perfil" : "perfiles"}
        {onlyFavorites ? " en favoritos" : ""}
      </p>

      {profiles.length === 0 ? (
        <div className="mt-3 flex flex-col items-center border border-[var(--line-strong)] bg-[var(--surface)] px-6 py-14 text-center rounded-lg">
          <span className="mono grid size-12 place-items-center border border-[var(--line)] bg-[var(--accent-soft)] rounded-lg">
            <Star className="size-5 text-[var(--fg)]" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
            Todavía no hay perfiles
          </h2>
          <p className="mt-1.5 max-w-md text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Convierte una sensibilidad y pulsa «Guardar en mi cuenta». Puedes
            tener varios perfiles por juego: ranked, casual, cadera o miras.
          </p>
          <Link href="/" className="btn btn-primary btn-sm mt-5">
            Ir a la calculadora
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-3 border border-[var(--line-strong)] bg-[var(--surface)] p-10 text-center rounded-lg">
          <p className="text-sm text-[var(--muted)]">
            No hay perfiles que coincidan con los filtros.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-4"
            onClick={() => {
              setQuery("");
              setOnlyFavorites(false);
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ul className="mt-2 grid gap-3 lg:grid-cols-2">
          {filtered.map((profile) => {
            const isEditing = editingId === profile.id;
            const isBusy = busyId === profile.id;
            return (
              <li
                key={profile.id}
                className="flex flex-col border border-[var(--line-strong)] bg-[var(--surface)] rounded-lg"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[0.95rem] font-semibold tracking-[-0.01em]">
                        {profile.name}
                      </h2>
                      {profile.isPreferred ? (
                        <span className="badge badge-accent shrink-0">
                          <BadgeCheck className="size-2.5" aria-hidden="true" />
                          Preferido
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--faint)]">
                      {profile.gameName} ·{" "}
                      {methodLabels[profile.method] ?? profile.method}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      run(profile.id, () =>
                        setProfileFavorite(profile.id, !profile.isFavorite),
                      )
                    }
                    disabled={isBusy}
                    className={cn(
                      "grid size-7 shrink-0 place-items-center border transition-colors",
                      profile.isFavorite
                        ? "border-[var(--warning)] text-[var(--warning)]"
                        : "border-[var(--line-strong)] text-[var(--faint)] hover:border-[var(--faint)] hover:text-[var(--fg)]",
                    )}
                    aria-label={
                      profile.isFavorite
                        ? `Quitar ${profile.name} de favoritos`
                        : `Marcar ${profile.name} como favorito`
                    }
                    aria-pressed={profile.isFavorite}
                  >
                    <Star
                      className="size-3.5"
                      fill={profile.isFavorite ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <dl className="grid grid-cols-3 gap-px border-b border-[var(--line)] bg-[var(--line)]">
                  {[
                    {
                      label: "Sensibilidad",
                      value: formatSensitivity(
                        profile.sensitivity,
                        profile.sensitivityDecimals,
                      ),
                      suffix: profile.sensitivityUnit,
                    },
                    {
                      label: "DPI",
                      value: formatMeasure(profile.dpi, 0),
                    },
                    {
                      label: "cm/360",
                      value: profile.cm360 ? formatMeasure(profile.cm360) : "—",
                    },
                  ].map((cell) => (
                    <div key={cell.label} className="bg-[var(--surface)] px-3 py-2">
                      <dt className="label text-xs">{cell.label}</dt>
                      <dd className="mono mt-0.5 text-[0.95rem] font-semibold">
                        {cell.value}
                        {cell.suffix ? (
                          <span className="ml-0.5 text-xs font-normal text-[var(--faint)]">
                            {cell.suffix}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-1 flex-col p-4 pt-3">
                  {profile.notes ? (
                    <p className="line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-[var(--muted)]">
                      {profile.notes}
                    </p>
                  ) : null}

                  <p className="mono mt-auto pt-3 text-xs text-[var(--faint)]">
                    Actualizado{" "}
                    {new Date(profile.updatedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {isEditing ? (
                    <EditProfileForm
                      profile={profile}
                      busy={isBusy}
                      onCancel={() => setEditingId(null)}
                      onSave={(payload) =>
                        run(
                          profile.id,
                          () => updateSensitivityProfile({ id: profile.id, ...payload }),
                          true,
                        )
                      }
                    />
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] pt-3">
                      <Link
                        href={`/?game=${encodeURIComponent(profile.gameId)}&sens=${profile.sensitivity}&dpi=${profile.dpi}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        Usar
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(profile.id)}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy || profile.isPreferred}
                        onClick={() =>
                          run(profile.id, () =>
                            setPreferredSensitivityProfile(profile.id),
                          )
                        }
                        aria-pressed={profile.isPreferred}
                      >
                        <BadgeCheck className="size-3.5" aria-hidden="true" />
                        {profile.isPreferred ? "Preferido" : "Preferir"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          run(profile.id, () => duplicateSensitivityProfile(profile.id))
                        }
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                        Duplicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleDelete(profile)}
                        className="text-[var(--danger)] hover:bg-[rgba(165,31,24,0.08)] sm:ml-auto"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EditProfileForm({
  profile,
  busy,
  onCancel,
  onSave,
}: {
  profile: SavedProfileView;
  busy: boolean;
  onCancel: () => void;
  onSave: (payload: {
    name: string;
    sensitivity: number;
    dpi: number;
    notes: string;
  }) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [sensitivity, setSensitivity] = useState(String(profile.sensitivity));
  const [dpi, setDpi] = useState(String(profile.dpi));
  const [notes, setNotes] = useState(profile.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      name: name.trim(),
      sensitivity: parseDecimal(sensitivity),
      dpi: parseDecimal(dpi),
      notes: notes.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 border border-[var(--line)] bg-[var(--bg-subtle)] p-3 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <p className="mono text-xs font-medium text-[var(--fg-soft)]">
          Editar perfil
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="grid size-6 place-items-center border border-transparent text-[var(--faint)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--fg)]"
          aria-label="Cancelar edición"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div>
        <label htmlFor={`edit-name-${profile.id}`} className="field-label">
          Nombre
        </label>
        <input
          id={`edit-name-${profile.id}`}
          type="text"
          maxLength={80}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field-input font-sans text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Sensibilidad"
          value={sensitivity}
          onChange={setSensitivity}
          step={0.001}
          min={0}
        />
        <NumberField
          label="DPI"
          value={dpi}
          onChange={setDpi}
          step={1}
          min={1}
          max={32000}
        />
      </div>
      <div>
        <label htmlFor={`edit-notes-${profile.id}`} className="field-label">
          Notas
        </label>
        <textarea
          id={`edit-notes-${profile.id}`}
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="field-input min-h-0 font-sans text-sm"
          placeholder="Ranked, cadera, miras…"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
