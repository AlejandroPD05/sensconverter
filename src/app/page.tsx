import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Calculator } from "@/components/calculator/calculator";
import { GlobalConverter } from "@/components/global/global-converter";
import { games } from "@/lib/games/registry";
import { getProfile } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";
import { formatMeasure } from "@/lib/format";

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
  const pending = games.length - verified - experimental;

  return (
    <div className="site-container pt-8 sm:pt-10">
      <section className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="animate-fade-up">
          <h1 className="display text-[clamp(2.5rem,5.6vw,4.2rem)]">
            La misma mano,
            <br />
            otro juego.
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Convierte tu sensibilidad entre CS2, VALORANT, Apex y otros
            shooters con el cm/360 como referencia física. Fórmulas
            documentadas, sin registro y sin prometer una precisión que el
            juego no permite.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="#calculator" className="btn btn-primary">
              Convertir ahora
              <ArrowDown className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/games" className="btn btn-secondary">
              Ver los juegos
            </Link>
          </div>
        </div>

        <dl className="fact-list animate-fade-up pt-1">
          <div>
            <dt className="label">Juegos verificados</dt>
            <dd className="mono text-lg font-bold">
              {verified}
              <span className="ml-1 text-[0.62rem] font-normal text-[var(--faint)]">
                de {games.length}
              </span>
            </dd>
          </div>
          <div>
            <dt className="label">Experimentales</dt>
            <dd className="mono text-lg font-bold">{experimental}</dd>
          </div>
          <div>
            <dt className="label">Pendientes de fórmula</dt>
            <dd className="mono text-lg font-bold">{pending}</dd>
          </div>
          <div>
            <dt className="label">Cuenta</dt>
            <dd className="text-lg font-bold">Opcional</dd>
          </div>
        </dl>
      </section>

      <div id="calculator" className="scroll-mt-28 pt-8 sm:pt-10">
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

      <section className="mt-12 scroll-mt-28" aria-labelledby="global-home-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line-strong)] pb-2">
          <div>
            <h2
              id="global-home-title"
              className="text-xl font-bold tracking-[-0.02em]"
            >
              Referencia global
            </h2>
            <p className="mt-0.5 text-[0.8rem] text-[var(--muted)]">
              Parte de centímetros, no del número de un slider.
            </p>
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

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="library-title">
          <div className="flex items-end justify-between gap-3 border-b border-[var(--line-strong)] pb-2">
            <h2 id="library-title" className="text-xl font-bold tracking-[-0.02em]">
              Biblioteca
            </h2>
            <Link
              href="/games"
              className="text-[0.72rem] font-semibold underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]"
            >
              Ver todos
            </Link>
          </div>
          <table className="data-table mt-2">
            <caption className="sr-only">
              Juegos con constante de yaw documentada
            </caption>
            <thead>
              <tr>
                <th scope="col">Juego</th>
                <th scope="col">Constante</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {games.slice(0, 6).map((game) => {
                const convertible =
                  Boolean(game.yaw) && game.verification !== "pending";
                return (
                  <tr key={game.id}>
                    <td className="font-semibold">{game.shortName}</td>
                    <td className="mono text-[0.78rem] text-[var(--muted)]">
                      {game.yaw ? formatMeasure(game.yaw, 4) : "—"}
                    </td>
                    <td>
                      <span
                        className={
                          game.verification === "verified"
                            ? "badge badge-success"
                            : game.verification === "experimental"
                              ? "badge badge-warning"
                              : "badge"
                        }
                      >
                        {game.verification === "verified"
                          ? "Verificado"
                          : game.verification === "experimental"
                            ? "Experimental"
                            : "Pendiente"}
                      </span>
                    </td>
                    <td className="text-right">
                      {convertible ? (
                        <Link
                          href={`/?game=${encodeURIComponent(game.id)}`}
                          className="inline-flex items-center gap-1 text-[0.72rem] font-semibold underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]"
                        >
                          Convertir
                          <ArrowUpRight className="size-3" aria-hidden="true" />
                        </Link>
                      ) : (
                        <Link
                          href="/methodology#limites"
                          className="text-[0.72rem] text-[var(--warning)] underline underline-offset-4"
                        >
                          Por qué no
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section
          className="flex flex-col justify-between bg-[var(--ink)] p-6 text-[var(--band-ink)] sm:p-8"
          aria-labelledby="method-title"
        >
          <div>
            <h2 id="method-title" className="text-xl font-bold tracking-[-0.02em]">
              ¿De dónde salen estos números?
            </h2>
            <p className="mt-2 max-w-md text-[0.82rem] leading-relaxed text-[var(--band-muted)]">
              La metodología explica la fórmula, la diferencia entre distancia
              360°, FOV aware y distancia de monitor, y por qué dos juegos con
              el mismo cm/360 no se sienten idénticos.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/methodology" className="btn btn-on-dark">
              Leer la metodología
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <span className="mono text-[0.58rem] uppercase tracking-[0.06em] text-[var(--band-muted)]">
              sin promesas de precisión perfecta
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
