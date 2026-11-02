import type { Metadata } from "next";
import Link from "next/link";
import { Compass, MousePointer2, Ruler } from "lucide-react";
import { GlobalConverter } from "@/components/global/global-converter";
import { getProfile } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sensibilidad global cm/360",
  description:
    "Define tu distancia física de 360° y calcula la sensibilidad equivalente en cada juego compatible.",
};

export default async function GlobalPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <div className="site-container pt-10 sm:pt-14">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow">Referencia física</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
          Tu punto de partida es <span className="text-gradient">el movimiento</span>
        </h1>
        <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--muted)]">
          El cm/360 es la distancia que recorre el ratón para girar 360°. Sirve
          como referencia entre juegos porque no depende del slider de cada
          título. Un mismo cm/360 no garantiza la misma sensación: el FOV, el
          zoom y los multiplicadores también importan.
        </p>
      </header>

      <div className="mt-8">
        <GlobalConverter
          canSave={Boolean(user)}
          initialCm360={profile?.global_cm360 ?? undefined}
          initialDpi={profile?.default_dpi ?? undefined}
        />
      </div>

      <section className="mt-12 grid gap-3 md:grid-cols-3" aria-label="Cómo usar la referencia global">
        {[
          {
            icon: Ruler,
            title: "Mide tu espacio",
            text: "Coloca una regla junto al ratón o usa una alfombrilla de tamaño conocido. Lo importante es que la distancia sea cómoda y repetible.",
          },
          {
            icon: MousePointer2,
            title: "Convierte una vez",
            text: "Guarda tu cm/360 y tu DPI. A partir de ahí, cada juego recibe su propia sensibilidad sin copiar números entre sliders incomparables.",
          },
          {
            icon: Compass,
            title: "Ajusta por sensación",
            text: "Si el resultado se siente extraño, revisa el FOV y los multiplicadores de mira antes de cambiar el cm/360. Da tiempo a tu mano a adaptarse.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass p-5">
              <span className="grid size-9 place-items-center rounded-lg border border-[var(--line-accent)] bg-[var(--accent)]/[0.07]">
                <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
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
            ¿Por qué no es una sensibilidad universal?
          </h2>
          <p className="mt-1 max-w-2xl text-[0.78rem] leading-relaxed text-[var(--muted)]">
            Porque cada motor interpreta el movimiento de forma distinta. La
            metodología detalla la fórmula, los métodos disponibles y sus
            límites.
          </p>
        </div>
        <Link href="/methodology" className="btn btn-secondary shrink-0">
          Ver metodología
        </Link>
      </section>
    </div>
  );
}
