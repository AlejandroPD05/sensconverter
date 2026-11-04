import type { Metadata } from "next";
import Link from "next/link";
import { GlobalConverter } from "@/components/global/global-converter";
import { getProfile } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/server";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Sensibilidad global cm/360",
  description:
    "Define tu distancia física de 360° y calcula la sensibilidad equivalente en cada juego compatible.",
};

const steps = [
  {
    step: "01",
    title: "Mide tu espacio",
    text: "Coloca una regla junto al ratón o usa una alfombrilla de tamaño conocido. Lo importante es que la distancia sea cómoda y repetible.",
  },
  {
    step: "02",
    title: "Convierte una vez",
    text: "Guarda tu cm/360 y tu DPI. A partir de ahí, cada juego recibe su propia sensibilidad sin copiar números entre sliders incomparables.",
  },
  {
    step: "03",
    title: "Ajusta por sensación",
    text: "Si el resultado se siente extraño, revisa el FOV y los multiplicadores de mira antes de cambiar el cm/360. Da tiempo a tu mano a adaptarse.",
  },
];

export default async function GlobalPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <>
      <PageHero lines={["Tu punto de partida", "es el movimiento."]}>
        <p>
          El cm/360 es la distancia que recorre el ratón para girar 360°. Sirve
          como referencia entre juegos porque no depende del slider de cada
          título. Un mismo cm/360 no garantiza la misma sensación: el FOV, el
          zoom y los multiplicadores también importan.
        </p>
      </PageHero>
      <div className="site-container pt-8 sm:pt-10">

      <div className="mt-6">
        <GlobalConverter
          canSave={Boolean(user)}
          initialCm360={profile?.global_cm360 ?? undefined}
          initialDpi={profile?.default_dpi ?? undefined}
        />
      </div>

      <section
        className="mt-10 grid overflow-hidden border border-[var(--line-strong)] md:grid-cols-3 rounded-lg"
        aria-label="Cómo usar la referencia global"
      >
        {steps.map((item) => (
          <article
            key={item.step}
            className="border-b border-[var(--line)] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <span className="mono text-xs font-semibold text-[var(--faint)]">
              {item.step}
            </span>
            <h2 className="mt-1 text-[0.95rem] font-semibold tracking-[-0.01em]">
              {item.title}
            </h2>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
              {item.text}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 flex flex-col items-start justify-between gap-4 border-t-2 border-[var(--line)] pt-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            ¿Por qué no es una sensibilidad universal?
          </h2>
          <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">
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
    </>
  );
}
