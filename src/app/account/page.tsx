import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Gauge, ListChecks, ShieldCheck, UserRound } from "lucide-react";
import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getProfile, getSensitivityProfiles } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="site-container max-w-3xl pt-10 sm:pt-14">
        <h1 className="display text-4xl">Mi cuenta</h1>
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

  const displayName = profile?.display_name?.trim() || user.email?.split("@")[0] || "Jugador";
  const initial = displayName.slice(0, 1).toUpperCase();
  const favorites = profiles.filter((item) => item.is_favorite).length;

  return (
    <div className="site-container pt-10 sm:pt-14">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl border border-[var(--line-accent)] bg-[var(--accent)]/[0.08] text-xl font-semibold text-[var(--accent)]">
            {initial}
          </span>
          <div>
            <p className="eyebrow">Cuenta</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
              {displayName}
            </h1>
            <p className="text-[0.76rem] text-[var(--faint)]">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<ListChecks className="size-4" aria-hidden="true" />}
          label="Perfiles guardados"
          value={String(profiles.length)}
          href="/my-sensitivities"
        />
        <Stat
          icon={<Gauge className="size-4" aria-hidden="true" />}
          label="cm/360 global"
          value={profile?.global_cm360 ? `${profile.global_cm360} cm` : "Sin definir"}
          href="/global"
        />
        <Stat
          icon={<UserRound className="size-4" aria-hidden="true" />}
          label="Favoritos"
          value={String(favorites)}
          href="/my-sensitivities"
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="glass p-5 sm:p-6" aria-labelledby="settings-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="settings-title" className="text-lg font-semibold tracking-[-0.02em]">
                Preferencias
              </h2>
              <p className="mt-1 text-[0.76rem] text-[var(--muted)]">
                Estos valores se usan como punto de partida, nunca sustituyen lo
                que escribes en la calculadora.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <AccountSettingsForm
              displayName={profile?.display_name ?? ""}
              defaultDpi={profile?.default_dpi ?? null}
              globalCm360={profile?.global_cm360 ?? null}
            />
          </div>
        </section>

        <aside className="space-y-3">
          <section className="glass p-5" aria-labelledby="session-title">
            <h2 id="session-title" className="text-sm font-semibold">
              Sesión y privacidad
            </h2>
            <dl className="mt-3 space-y-3 text-[0.72rem]">
              <div>
                <dt className="text-[var(--faint)]">Cuenta creada</dt>
                <dd className="mt-0.5 text-[var(--text-soft)]">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--faint)]">Proveedor</dt>
                <dd className="mt-0.5 text-[var(--text-soft)]">
                  Correo y contraseña (Supabase Auth)
                </dd>
              </div>
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-[0.66rem] leading-relaxed text-[var(--faint)]">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
              Tus perfiles están aislados con Row Level Security. Ningún otro
              usuario puede leerlos ni modificarlos.
            </p>
          </section>

          <section className="glass p-5">
            <h2 className="text-sm font-semibold">Accesos rápidos</h2>
            <div className="mt-3 space-y-1.5">
              <Link
                href="/"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.75rem] text-[var(--muted)] hover:bg-white/[0.04] hover:text-white"
              >
                Calculadora <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/my-sensitivities"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.75rem] text-[var(--muted)] hover:bg-white/[0.04] hover:text-white"
              >
                Mis sensibilidades <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/global"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.75rem] text-[var(--muted)] hover:bg-white/[0.04] hover:text-white"
              >
                Sensibilidad global <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass group flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
    >
      <span className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[var(--accent)]">
        {icon}
      </span>
      <span>
        <span className="block text-[0.62rem] uppercase tracking-[0.1em] text-[var(--faint)]">
          {label}
        </span>
        <span className="mono mt-0.5 block text-base font-semibold">{value}</span>
      </span>
    </Link>
  );
}
