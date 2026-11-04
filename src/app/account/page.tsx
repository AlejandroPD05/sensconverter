import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
      <div className="site-container max-w-3xl pt-8 sm:pt-10">
        <p className="label">Cuenta</p>
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
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div className="flex items-center gap-4">
          <span
            className="mono grid size-14 shrink-0 place-items-center border border-[var(--line)] bg-[var(--accent-soft)] text-xl font-semibold text-[var(--fg)] rounded-lg"
            aria-hidden="true"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="label">Cuenta</p>
            <h1 className="mt-1 text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-none tracking-[-0.035em]">
              {displayName}
            </h1>
            <p className="mono mt-1 truncate text-xs text-[var(--faint)]">
              {user.email}
            </p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <dl className="grid border-b border-[var(--line-strong)] sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex items-baseline justify-between gap-3 border-b border-[var(--line)] px-1 py-3 transition-colors hover:bg-[var(--surface)] sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0"
          >
            <dt className="label group-hover:text-[var(--fg)]">{stat.label}</dt>
            <dd className="mono text-lg font-semibold">{stat.value}</dd>
          </Link>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section
          className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 rounded-lg"
          aria-labelledby="settings-title"
        >
          <h2
            id="settings-title"
            className="text-[0.8125rem] font-semibold"
          >
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

        <aside className="grid content-start gap-4">
          <section
            className="border border-[var(--line-strong)] p-4 sm:p-5 rounded-lg"
            aria-labelledby="session-title"
          >
            <h2
              id="session-title"
              className="text-[0.8125rem] font-semibold"
            >
              Sesión y privacidad
            </h2>
            <dl className="mt-3 grid">
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2">
                <dt className="text-xs text-[var(--faint)]">
                  Cuenta creada
                </dt>
                <dd className="mono text-xs">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2">
                <dt className="text-xs text-[var(--faint)]">Proveedor</dt>
                <dd className="text-xs">Correo y contraseña</dd>
              </div>
            </dl>
            <p className="mt-3 border-l-2 border-[var(--success)] pl-2.5 text-xs leading-relaxed text-[var(--muted)]">
              Tus perfiles están aislados con Row Level Security. Ningún otro
              usuario puede leerlos ni modificarlos.
            </p>
          </section>

          <section className="border border-[var(--line-strong)] p-4 sm:p-5 rounded-lg">
            <h2 className="text-[0.8125rem] font-semibold">
              Accesos rápidos
            </h2>
            <div className="mt-2 grid">
              {[
                { href: "/", label: "Calculadora" },
                { href: "/my-sensitivities", label: "Mis sensibilidades" },
                { href: "/global", label: "Sensibilidad global" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 text-[0.8125rem] text-[var(--fg-soft)] transition-colors last:border-b-0 hover:text-[var(--fg)]"
                >
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
