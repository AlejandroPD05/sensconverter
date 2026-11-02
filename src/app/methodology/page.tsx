import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import { conversionMethods } from "@/lib/conversion/engine";
import { games } from "@/lib/games/registry";
import { formatMeasure } from "@/lib/format";

export const metadata: Metadata = {
  title: "Metodología y límites",
  description:
    "Fórmulas, verificación de constantes y límites de la conversión de sensibilidad. Sin promesas de precisión perfecta.",
};

export default function MethodologyPage() {
  const verified = games.filter((game) => game.verification === "verified");
  const experimental = games.filter((game) => game.verification === "experimental");
  const pending = games.filter((game) => game.verification === "pending");

  return (
    <div className="site-container pt-10 sm:pt-14">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow">Metodología</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
          Matemáticas claras, <span className="text-gradient">límites claros</span>
        </h1>
        <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--muted)]">
          Esta herramienta convierte la distancia física de un giro de 360°. No
          promete que dos juegos se sientan idénticos, porque no es cierto. Aquí
          está exactamente qué calculamos, qué asumimos y qué no.
        </p>
      </header>

      <div className="mt-9 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="glass p-5 sm:p-6" aria-labelledby="formula-title">
          <h2 id="formula-title" className="text-lg font-semibold tracking-[-0.02em]">
            La fórmula base
          </h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--muted)]">
            Para un juego con modelo yaw lineal, cada cuenta del ratón gira un
            ángulo fijo. La sensibilidad multiplica ese ángulo:
          </p>
          <div className="result-surface mono mt-4 overflow-x-auto rounded-[var(--radius-md)] px-4 py-5 text-center text-[0.9rem] sm:text-base">
            <p>cm/360 = (360 × 2.54) / (DPI × sensibilidad × yaw)</p>
          </div>
          <p className="mt-4 text-[0.8rem] leading-relaxed text-[var(--muted)]">
            La inversa sirve para obtener la sensibilidad que corresponde a una
            distancia objetivo:
          </p>
          <div className="glass-inset mono mt-2 overflow-x-auto rounded-[var(--radius-md)] px-4 py-4 text-center text-[0.82rem] sm:text-[0.9rem]">
            <p>sensibilidad = (360 × 2.54) / (DPI × cm/360 × yaw)</p>
          </div>
          <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--muted)]">
            Ejemplo verificable: VALORANT 0.4 a 800 DPI con yaw 0.07 produce{" "}
            <span className="mono text-white">
              {formatMeasure((360 * 2.54) / (800 * 0.4 * 0.07))} cm
            </span>{" "}
            por cada 360°. Las webs suelen redondearlo a 40.8 cm.
          </p>
        </section>

        <aside className="glass p-5" aria-labelledby="status-title">
          <h2 id="status-title" className="text-sm font-semibold">
            Estado del registro
          </h2>
          <ul className="mt-3 space-y-3 text-[0.75rem]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              <span>
                <strong className="text-white">{verified.length} verificados.</strong>{" "}
                Constante documentada y contraste con fuentes públicas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              <span>
                <strong className="text-white">{experimental.length} experimental.</strong>{" "}
                Conversión disponible con advertencia explícita.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--faint)]" aria-hidden="true" />
              <span>
                <strong className="text-white">{pending.length} pendientes.</strong>{" "}
                Sin conversión hasta verificar la fórmula.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-[0.68rem] leading-relaxed text-[var(--faint)]">
            Última revisión del registro: 29/10/2026. Una actualización del juego
            puede invalidar una constante; verifica en el rango de práctica.
          </p>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="methods-title">
        <h2 id="methods-title" className="text-2xl font-semibold tracking-[-0.03em]">
          Los métodos no son intercambiables
        </h2>
        <p className="mt-2 max-w-3xl text-[0.82rem] leading-relaxed text-[var(--muted)]">
          Cada objetivo conserva una cosa distinta. Elegir uno u otro cambia el
          resultado, y ninguno corrige por sí solo el ADS, el recoil o la
          aceleración del ratón.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {conversionMethods.map((method) => (
            <article key={method.id} className="glass p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{method.name}</h3>
                <span className="badge">{method.requiresFov ? "requiere FOV" : "sin FOV"}</span>
              </div>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--muted)]">
                {method.shortDescription}
              </p>
              <dl className="mt-3 space-y-2 text-[0.72rem] leading-relaxed">
                <div>
                  <dt className="font-semibold text-[var(--success)]">Conserva</dt>
                  <dd className="text-[var(--text-soft)]">{method.preserves}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--warning)]">No conserva</dt>
                  <dd className="text-[var(--muted)]">{method.doesNotPreserve}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="verification-title">
        <h2 id="verification-title" className="text-2xl font-semibold tracking-[-0.03em]">
          Cómo verificamos un juego
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Constante documentada",
              text: "Partimos de una constante publicada y contrastada, no de una medición aislada ni de una copia de otra calculadora.",
            },
            {
              step: "02",
              title: "Modelo compatible",
              text: "Comprobamos que el juego use un modelo yaw lineal para la sensibilidad de cadera. Si depende del FOV o de multiplicadores, se marca.",
            },
            {
              step: "03",
              title: "Prueba de ida y vuelta",
              text: "La conversión se prueba en ambos sentidos y contra ejemplos de referencia. El redondeo se aplica solo al valor que se muestra.",
            },
          ].map((item) => (
            <article key={item.step} className="glass p-5">
              <span className="mono text-[0.68rem] text-[var(--accent)]">{item.step}</span>
              <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[0.76rem] leading-relaxed text-[var(--muted)]">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.78rem]">
              <thead className="bg-white/[0.03] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--faint)]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Juego</th>
                  <th className="px-4 py-2.5 font-medium">Yaw (°/count)</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 font-medium">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {[...verified, ...experimental].map((game) => (
                  <tr key={game.id} className="border-t border-white/[0.05]">
                    <td className="px-4 py-2.5 font-medium">{game.name}</td>
                    <td className="mono px-4 py-2.5 text-[var(--accent)]">{game.yaw}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          game.verification === "verified" ? "badge badge-success" : "badge badge-warning"
                        }
                      >
                        {game.verification === "verified" ? "Verificado" : "Experimental"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">
                      {game.yawSource ? (
                        <a
                          href={game.yawSource.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline decoration-white/20 underline-offset-4 hover:text-white"
                        >
                          {game.yawSource.label}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-3 lg:grid-cols-2" aria-labelledby="limits-title" id="limites">
        <article className="glass p-5 sm:p-6">
          <h2 id="limits-title" className="text-lg font-semibold tracking-[-0.02em]">
            Lo que esta herramienta no hace
          </h2>
          <ul className="mt-3 space-y-2.5 text-[0.78rem] leading-relaxed text-[var(--muted)]">
            {[
              "No convierte la sensibilidad de miras o ADS salvo que el juego tenga una fórmula verificada; el resultado es de cadera.",
              "No modela recoil, aceleración del ratón, suavizado ni la respuesta del motor.",
              "No garantiza que el slider acepte el valor calculado: cada juego redondea y limita de forma distinta.",
              "No inventa constantes para juegos pendientes ni rellena resultados con datos de relleno.",
              "No promete que un mismo cm/360 se sienta idéntico entre juegos con FOV o zooms diferentes.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--warning)]" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Por qué el mismo cm/360 se siente distinto
          </h2>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-[var(--muted)]">
            El cm/360 iguala la distancia física de un giro completo, pero la
            imagen en pantalla no es la misma. Un FOV más amplio reparte los
            mismos grados en más píxeles; un zoom cambia la escala; el ADS, el
            recoil y la respuesta del motor añaden diferencias que ninguna
            división puede eliminar.
          </p>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-[var(--muted)]">
            Si el resultado se siente mal, ajusta primero el FOV y los
            multiplicadores del juego. Cambia el cm/360 en pasos pequeños y da
            tiempo a la adaptación. La referencia física es un punto de partida,
            no una garantía de sensación idéntica.
          </p>
        </article>
      </section>

      <section className="glass mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            ¿Listo para calcular?
          </h2>
          <p className="mt-1 text-[0.78rem] text-[var(--muted)]">
            La calculadora funciona sin cuenta. Si quieres guardar perfiles,
            puedes crear una cuenta opcional.
          </p>
        </div>
        <Link href="/" className="btn btn-primary shrink-0">
          Abrir calculadora
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
