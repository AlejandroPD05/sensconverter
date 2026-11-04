import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getProfile, getSensitivityProfiles } from "@/lib/db/profiles";
import type { SensitivityProfileRow } from "@/lib/db/types";
import { getGame } from "@/lib/games/registry";
import { formatMeasure, formatSensitivity } from "@/lib/format";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Mi cuenta" };

const RECENT_LIMIT = 5;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function calculatorHref(profile: SensitivityProfileRow) {
  return `/?game=${encodeURIComponent(profile.game_id)}&sens=${profile.sensitivity}&dpi=${profile.dpi}`;
}

function sensitivityLabel(profile: SensitivityProfileRow) {
  const game = getGame(profile.game_id);
  return game
    ? formatSensitivity(profile.sensitivity, game.sensitivity.decimals)
    : String(profile.sensitivity);
}

/**
 * Un juego es favorito cuando tiene al menos un perfil marcado como favorito.
 * Se muestra el perfil preferido si existe; si no, el favorito más reciente.
 */
function favoriteGames(profiles: SensitivityProfileRow[]) {
  const favorites = profiles
    .filter((profile) => profile.is_favorite)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const gameIds = [...new Set(favorites.map((profile) => profile.game_id))];

  return gameIds.map(
    (gameId) =>
      profiles.find((profile) => profile.game_id === gameId && profile.is_preferred) ??
      favorites.find((profile) => profile.game_id === gameId)!,
  );
}

export default async function AccountPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="site-container max-w-3xl pt-8 sm:pt-10">
        <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3rem)]">Mi cuenta</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          El registro es opcional y requiere configurar Supabase.
        </p>
        <div className="mt-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [profile, profiles] = await Promise.all([
    getProfile(user.id),
    getSensitivityProfiles(user.id),
  ]);

  const displayName =
    profile?.display_name?.trim() || user.email?.split("@")[0] || "Jugador";
  const initial = displayName.slice(0, 1).toUpperCase();
  const favorites = profiles.filter((item) => item.is_favorite).length;
  const recent = [...profiles]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, RECENT_LIMIT);
  const games = favoriteGames(profiles);

  const stats = [
    {
      label: "Perfiles guardados",
      value: String(profiles.length),
      href: "/my-sensitivities",
    },
    {
      label: "cm/360 global",
      value: profile?.global_cm360 ? `${profile.global_cm360} cm` : "Sin definir",
      href: "/global",
    },
    {
      label: "Favoritos",
      value: String(favorites),
      href: "/my-sensitivities",
    },
  ];

  return (
    <div className="site-container pt-8 sm:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xl font-semibold text-[var(--on-accent)]"
            aria-hidden="true"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="mt-1 text-[clamp(1.6rem,4vw,2.2rem)] font-semibold leading-none tracking-[-0.03em]">
              {displayName}
            </h1>
            <p className="mt-1 truncate text-xs text-[var(--faint)]">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex items-baseline justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--line-strong)]"
          >
            <dt className="label group-hover:text-[var(--fg)]">{stat.label}</dt>
            <dd className="mono text-lg font-semibold">{stat.value}</dd>
          </Link>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="grid content-start gap-4">
          <section
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            aria-labelledby="recent-title"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="recent-title" className="text-[0.95rem] font-semibold">
                Configuraciones recientes
              </h2>
              <Link
                href="/my-sensitivities"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Ver todas
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Todavía no has guardado ninguna. Convierte en la{" "}
                <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
                  calculadora
                </Link>{" "}
                y pulsa «Guardar en mi cuenta».
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--line)]" data-testid="recent-profiles">
                {recent.map((item) => {
                  const game = getGame(item.game_id);
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-[var(--faint)]">
                          {game?.shortName ?? item.game_id} ·{" "}
                          <span className="mono">
                            {sensitivityLabel(item)} @ {item.dpi} DPI
                            {item.cm360 ? ` · ${formatMeasure(item.cm360, 1)} cm/360` : ""}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <time
                          dateTime={item.updated_at}
                          className="text-xs text-[var(--faint)]"
                        >
                          {dateFormat.format(new Date(item.updated_at))}
                        </time>
                        <Link
                          href={calculatorHref(item)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                        >
                          Cargar
                          <ArrowUpRight className="size-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            aria-labelledby="settings-title"
          >
            <h2 id="settings-title" className="text-[0.95rem] font-semibold">
              Preferencias
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Estos valores se usan como punto de partida, nunca sustituyen lo que
              escribes en la calculadora.
            </p>
            <div className="mt-4">
              <AccountSettingsForm
                displayName={profile?.display_name ?? ""}
                defaultDpi={profile?.default_dpi ?? null}
                globalCm360={profile?.global_cm360 ?? null}
              />
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            aria-labelledby="favorite-games-title"
          >
            <h2 id="favorite-games-title" className="text-[0.95rem] font-semibold">
              Juegos favoritos
            </h2>
            {games.length === 0 ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Marca un perfil con la estrella en{" "}
                <Link
                  href="/my-sensitivities"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Mis sensibilidades
                </Link>{" "}
                y su juego aparecerá aquí.
              </p>
            ) : (
              <ul className="mt-2 grid" data-testid="favorite-games">
                {games.map((item) => {
                  const game = getGame(item.game_id);
                  return (
                    <li key={item.game_id}>
                      <Link
                        href={calculatorHref(item)}
                        className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 text-sm last:border-b-0 hover:text-[var(--accent)]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Star
                            className="size-3.5 shrink-0 fill-[var(--accent)] text-[var(--accent)]"
                            aria-hidden="true"
                          />
                          <span className="truncate">{game?.shortName ?? item.game_id}</span>
                        </span>
                        <span className="mono text-xs text-[var(--muted)]">
                          {sensitivityLabel(item)}
                          {item.is_preferred ? " · preferido" : ""}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            aria-labelledby="session-title"
          >
            <h2 id="session-title" className="text-[0.95rem] font-semibold">
              Sesión y privacidad
            </h2>
            <dl className="mt-3 grid">
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2">
                <dt className="text-xs text-[var(--faint)]">Cuenta creada</dt>
                <dd className="mono text-xs">
                  {dateFormat.format(new Date(user.created_at))}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-2">
                <dt className="text-xs text-[var(--faint)]">Proveedor</dt>
                <dd className="text-xs">Correo y contraseña</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-md bg-[var(--success-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--success)]">
              Tus perfiles están aislados con Row Level Security. Ningún otro
              usuario puede leerlos ni modificarlos.
            </p>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <h2 className="text-[0.95rem] font-semibold">Accesos rápidos</h2>
            <div className="mt-2 grid">
              {[
                { href: "/", label: "Calculadora" },
                { href: "/my-sensitivities", label: "Mis sensibilidades" },
                { href: "/global", label: "Sensibilidad global" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 text-sm text-[var(--fg-soft)] transition-colors last:border-b-0 hover:text-[var(--accent)]"
                >
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section
            className="rounded-xl border border-[#fecaca] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title" className="text-[0.95rem] font-semibold text-[var(--danger)]">
              Eliminar cuenta
            </h2>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Borra tu usuario y todos tus perfiles de la base de datos. La
              calculadora seguirá funcionando sin cuenta.
            </p>
            <DeleteAccountForm />
          </section>
        </aside>
      </div>
    </div>
  );
}
