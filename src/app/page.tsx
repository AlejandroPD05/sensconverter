import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  Gauge,
  MousePointer2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Calculator } from "@/components/calculator/calculator";
import { GlobalConverter } from "@/components/global/global-converter";
import { games } from "@/lib/games/registry";
import { getProfile } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Conversor de sensibilidad y cm/360",
  description: brand.description,
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const initialDpi =
    first(params.dpi) ??
    (profile?.default_dpi !== null && profile?.default_dpi !== undefined
      ? String(profile.default_dpi)
      : undefined);
  const verified = games.filter((game) => game.verification === "verified").length;
  const experimental = games.filter(
    (game) => game.verification === "experimental",
  ).length;

  return (
    <div className="site-container pt-10 sm:pt-14">
      <section className="grid items-end gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="animate-fade-up">
          <p className="eyebrow">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Sensibilidad con criterio
          </p>
          <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5.2rem)]">
            Una sensibilidad.
            <br />
            <span className="text-gradient">Todos tus juegos.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Convierte entre CS2, VALORANT, Apex, Overwatch 2 y más usando
            fórmulas documentadas. Sin registro, sin promesas de precisión
            falsa y con el cm/360 como referencia real.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="#calculator" className="btn btn-primary">
              Convertir ahora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/games" className="btn btn-secondary">
              <Gamepad2 className="size-4" aria-hidden="true" />
              Ver juegos compatibles
            </Link>
          </div>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--faint)]">
                Juegos verificados
              </dt>
              <dd className="mono mt-0.5 text-xl font-semibold">
                {verified}
                {experimental > 0 ? (
                  <span className="ml-1 text-[0.7rem] font-normal text-[var(--faint)]">
                    +{experimental} exp.
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--faint)]">
                Métodos
              </dt>
              <dd className="mono mt-0.5 text-xl font-semibold">3</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--faint)]">
                Registro
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-xl font-semibold">
                Opcional
              </dd>
            </div>
          </dl>
        </div>

        <div className="glass animate-fade-up animate-delay-1 relative overflow-hidden p-5">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--accent)]/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">
              Referencia global
            </p>
            <span className="badge badge-accent">ejemplo</span>
          </div>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="mono text-[3.6rem] font-semibold leading-none tracking-[-0.06em]">
              40
            </span>
            <span className="text-sm text-[var(--muted)]">cm / 360°</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[10, 20, 40].map((distance, index) => (
              <div key={distance} className="glass-inset px-2 py-2 text-center">
                <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[var(--faint)]">
                  {[90, 180, 360][index]}°
                </p>
                <p className="mono mt-0.5 text-[0.8rem] font-semibold">
                  {distance} cm
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5">
            <MousePointer2 className="size-4 text-[var(--accent)]" aria-hidden="true" />
            <p className="text-[0.68rem] leading-relaxed text-[var(--muted)]">
              A 800 DPI son <span className="mono text-white">0.408</span> en
              VALORANT o <span className="mono text-white">1.30</span> en CS2.
            </p>
          </div>
          <Link
            href="/global"
            className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-[var(--accent)] hover:underline"
          >
            Configurar mi referencia
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div id="calculator" className="scroll-mt-24 pt-10 sm:pt-12">
        <Calculator
          canSave={Boolean(user)}
          initial={{
            sourceGameId: first(params.game),
            targetGameId: first(params.target),
            sensitivity: first(params.sens),
            dpi: initialDpi,
          }}
        />
      </div>

      <section className="mt-12 scroll-mt-24" aria-labelledby="global-home-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              <Gauge className="size-3.5" aria-hidden="true" />
              Tu referencia
            </p>
            <h2 id="global-home-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
              Calcula desde centímetros, no desde números
            </h2>
          </div>
          <Link href="/global" className="btn btn-ghost btn-sm">
            Abrir herramienta completa
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <GlobalConverter
          canSave={Boolean(user)}
          initialCm360={profile?.global_cm360 ?? undefined}
          initialDpi={profile?.default_dpi ?? undefined}
          variant="compact"
        />
      </section>

      <section className="mt-14 grid gap-3 md:grid-cols-3" aria-label="Principios del producto">
        {[
          {
            icon: ShieldCheck,
            title: "Fórmulas documentadas",
            text: "Cada juego declara su constante y su fuente. Lo que no está verificado no devuelve un número.",
          },
          {
            icon: CheckCircle2,
            title: "Sin cuenta obligatoria",
            text: "La calculadora completa funciona al instante. La cuenta solo añade guardado y sincronización.",
          },
          {
            icon: Gauge,
            title: "cm/360, no humo",
            text: "La distancia física es la referencia común. Te explicamos qué conserva cada método y qué no.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass p-5">
              <span className="grid size-9 place-items-center rounded-lg border border-[var(--line-accent)] bg-[var(--accent)]/[0.07]">
                <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[0.76rem] leading-relaxed text-[var(--muted)]">
                {item.text}
              </p>
            </article>
          );
        })}
      </section>

      <section className="glass mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            ¿De dónde salen estos números?
          </h2>
          <p className="mt-1 max-w-2xl text-[0.78rem] leading-relaxed text-[var(--muted)]">
            La metodología explica la fórmula, la diferencia entre distancia
            360°, FOV aware y distancia de monitor, y por qué dos juegos con el
            mismo cm/360 no se sienten idénticos.
          </p>
        </div>
        <Link href="/methodology" className="btn btn-secondary shrink-0">
          Leer la metodología
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
