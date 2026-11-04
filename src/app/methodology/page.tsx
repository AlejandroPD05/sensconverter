import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { conversionMethods } from "@/lib/conversion/engine";
import { fovScaleLabels } from "@/lib/conversion/fov";
import { games } from "@/lib/games/registry";
import { formatMeasure } from "@/lib/format";

export const metadata: Metadata = {
  title: "Metodología y límites",
  description:
    "Fórmulas, verificación de constantes y límites de la conversión de sensibilidad. Sin promesas de precisión perfecta.",
};

const verificationSteps = [
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
];

const limits = [
  "Solo calcula miras en juegos con un modelo de zoom documentado (TF2 verificado; CS2 experimental, solo la AWP). En el resto, el resultado es de cadera.",
  "No ofrece Viewspeed: no hemos encontrado una fórmula pública y verificable, y no la aproximamos.",
  "No modela recoil, aceleración del ratón, suavizado ni la respuesta del motor.",
  "No garantiza que el slider acepte el valor calculado: cada juego redondea y limita de forma distinta.",
  "No inventa constantes para juegos pendientes ni rellena resultados con datos de relleno.",
  "No promete que un mismo cm/360 se sienta idéntico entre juegos con FOV o zooms diferentes.",
];

export default function MethodologyPage() {
  const verified = games.filter((game) => game.verification === "verified");
  const experimental = games.filter((game) => game.verification === "experimental");
  const pending = games.filter((game) => game.verification === "pending");

  return (
    <div className="site-container pt-8 sm:pt-10">
      <header className="grid gap-5 border-b border-[var(--line)] pb-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-end">
        <div>
          <p className="label">Metodología</p>
          <h1 className="display mt-2 text-[clamp(2.2rem,5vw,3.6rem)]">
            Matemáticas claras,
            <br />
            límites claros.
          </h1>
        </div>
        <p className="max-w-md text-[0.88rem] leading-relaxed text-[var(--muted)] md:justify-self-end">
          Esta herramienta convierte la distancia física de un giro de 360°. No
          promete que dos juegos se sientan idénticos, porque no es cierto. Aquí
          está exactamente qué calculamos, qué asumimos y qué no.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section
          className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 rounded-lg"
          aria-labelledby="formula-title"
        >
          <h2
            id="formula-title"
            className="text-[0.8125rem] font-semibold"
          >
            La fórmula base
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Para un juego con modelo yaw lineal, cada cuenta del ratón gira un
            ángulo fijo. La sensibilidad multiplica ese ángulo:
          </p>
          <div className="result-surface mono mt-3 overflow-x-auto px-4 py-4 text-[0.8125rem] sm:text-[0.9rem]">
            <p>cm/360 = (360 × 2.54) / (DPI × sensibilidad × yaw)</p>
          </div>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            La inversa sirve para obtener la sensibilidad que corresponde a una
            distancia objetivo:
          </p>
          <div className="mt-2 overflow-x-auto border border-[var(--line-strong)] bg-[var(--surface-muted)] px-4 py-3.5 text-center rounded-lg">
            <p className="mono text-xs sm:text-[0.8125rem]">
              sensibilidad = (360 × 2.54) / (DPI × cm/360 × yaw)
            </p>
          </div>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Ejemplo verificable: VALORANT 0.4 a 800 DPI con yaw 0.07 produce{" "}
            <span className="mono font-semibold text-[var(--fg)]">
              {formatMeasure((360 * 2.54) / (800 * 0.4 * 0.07))} cm
            </span>{" "}
            por cada 360°. Las webs suelen redondearlo a 40.8 cm.
          </p>
        </section>

        <aside
          className="border border-[var(--line-strong)] p-4 sm:p-5 rounded-lg"
          aria-labelledby="status-title"
        >
          <h2
            id="status-title"
            className="text-[0.8125rem] font-semibold"
          >
            Estado del registro
          </h2>
          <dl className="mt-3 border-t border-[var(--line-strong)]">
            {[
              { value: verified.length, label: "Verificados", tone: "success" },
              { value: experimental.length, label: "Experimentales", tone: "warning" },
              { value: pending.length, label: "Pendientes", tone: "faint" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2"
              >
                <dt className="text-xs text-[var(--muted)]">{row.label}</dt>
                <dd
                  className={
                    row.tone === "success"
                      ? "mono text-lg font-semibold text-[var(--success)]"
                      : row.tone === "warning"
                        ? "mono text-lg font-semibold text-[var(--warning)]"
                        : "mono text-lg font-semibold text-[var(--faint)]"
                  }
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-[var(--faint)]">
            Última revisión del registro: 29/10/2026. Una actualización del juego
            puede invalidar una constante; verifica en el rango de práctica.
          </p>
        </aside>
      </div>

      <section className="mt-10" aria-labelledby="methods-title">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-2">
          <h2 id="methods-title" className="text-xl font-semibold tracking-[-0.02em]">
            Los métodos no son intercambiables
          </h2>
          <span className="mono text-xs text-[var(--faint)]">
            {conversionMethods.length} métodos
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">
          Cada objetivo conserva una cosa distinta. Elegir uno u otro cambia el
          resultado, y ninguno corrige por sí solo el ADS, el recoil o la
          aceleración del ratón.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {conversionMethods.map((method) => (
            <article
              key={method.id}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[0.92rem] font-semibold tracking-[-0.01em]">
                  {method.name}
                </h3>
                <span className="badge shrink-0">
                  {method.requiresFov ? "requiere FOV" : "sin FOV"}
                </span>
              </div>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                {method.shortDescription}
              </p>
              <dl className="mt-3 grid gap-2 border-t border-[var(--line)] pt-3 text-xs leading-relaxed">
                <div>
                  <dt className="mono text-xs font-medium text-[var(--success)]">
                    Conserva
                  </dt>
                  <dd className="mt-0.5 text-[var(--fg-soft)]">{method.preserves}</dd>
                </div>
                <div>
                  <dt className="mono text-xs font-medium text-[var(--warning)]">
                    No conserva
                  </dt>
                  <dd className="mt-0.5 text-[var(--muted)]">
                    {method.doesNotPreserve}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="fov-title">
        <div className="border-b border-[var(--line)] pb-2">
          <h2 id="fov-title" className="text-xl font-semibold tracking-[-0.02em]">
            Cómo mide cada juego el FOV
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">
          Cada juego expresa el FOV en sus propias unidades: horizontal como si
          la pantalla fuera 4:3, horizontal como si fuera 16:9, o vertical. Antes
          de comparar dos juegos convertimos ese valor al FOV real de tu monitor
          (todos estos juegos son Hor+: el vertical se mantiene y un monitor más
          ancho ve más a los lados). La distancia de monitor compara el ángulo
          que cubre el mismo porcentaje de media pantalla, medido desde el centro
          en horizontal o en vertical; al 0% es una razón de tangentes (focal
          length).
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)]">
          <table className="data-table">
            <caption className="sr-only">Convención de FOV de cada juego</caption>
            <thead>
              <tr>
                <th scope="col">Juego</th>
                <th scope="col">Medida</th>
                <th scope="col">Rango</th>
                <th scope="col">Estado</th>
                <th scope="col" className="hidden md:table-cell">
                  Fuente
                </th>
              </tr>
            </thead>
            <tbody>
              {games
                .filter((game) => game.fov || game.fovGap)
                .map((game) => (
                  <tr key={game.id}>
                    <td className="font-semibold">{game.shortName}</td>
                    <td className="text-[0.8125rem]">
                      {game.fov ? fovScaleLabels[game.fov.scale] : "Sin documentar"}
                    </td>
                    <td className="mono whitespace-nowrap text-[0.8125rem]">
                      {game.fov
                        ? game.fov.fixed
                          ? `${game.fov.fixed} fijo`
                          : `${game.fov.min}–${game.fov.max}`
                        : "—"}
                    </td>
                    <td>
                      {game.fov ? (
                        <span
                          className={
                            game.fov.verification === "verified"
                              ? "badge badge-success"
                              : "badge badge-warning"
                          }
                        >
                          {game.fov.verification === "verified"
                            ? "Verificado"
                            : "Experimental"}
                        </span>
                      ) : (
                        <span className="badge">No disponible</span>
                      )}
                    </td>
                    <td className="hidden text-[var(--muted)] md:table-cell">
                      {game.fov ? (
                        <a
                          href={game.fov.source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)]"
                        >
                          {game.fov.source.label}
                        </a>
                      ) : (
                        game.fovGap
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="verification-title">
        <div className="border-b border-[var(--line)] pb-2">
          <h2
            id="verification-title"
            className="text-xl font-semibold tracking-[-0.02em]"
          >
            Cómo verificamos un juego
          </h2>
        </div>
        <div className="mt-4 grid overflow-hidden border border-[var(--line-strong)] md:grid-cols-3 rounded-lg">
          {verificationSteps.map((item) => (
            <article
              key={item.step}
              className="border-b border-[var(--line)] p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <span className="mono text-xs font-semibold text-[var(--faint)]">
                {item.step}
              </span>
              <h3 className="mt-1 text-[0.92rem] font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto border border-[var(--line-strong)] rounded-lg">
          <table className="data-table">
            <caption className="sr-only">
              Constantes de yaw verificadas y experimentales con su fuente
            </caption>
            <thead>
              <tr>
                <th scope="col">Juego</th>
                <th scope="col">Yaw (°/count)</th>
                <th scope="col">Estado</th>
                <th scope="col" className="hidden md:table-cell">
                  Fuente
                </th>
              </tr>
            </thead>
            <tbody>
              {[...verified, ...experimental].map((game) => (
                <tr key={game.id}>
                  <td className="font-semibold">{game.name}</td>
                  <td className="mono text-[0.8125rem]">{game.yaw}</td>
                  <td>
                    <span
                      className={
                        game.verification === "verified"
                          ? "badge badge-success"
                          : "badge badge-warning"
                      }
                    >
                      {game.verification === "verified"
                        ? "Verificado"
                        : "Experimental"}
                    </span>
                  </td>
                  <td className="hidden text-[var(--muted)] md:table-cell">
                    {game.yawSource ? (
                      <a
                        href={game.yawSource.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)]"
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
      </section>

      <section
        className="mt-10 grid gap-4 lg:grid-cols-2"
        aria-labelledby="limits-title"
        id="limites"
      >
        <article className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 rounded-lg">
          <h2
            id="limits-title"
            className="text-lg font-semibold tracking-[-0.02em]"
          >
            Lo que esta herramienta no hace
          </h2>
          <ul className="mt-3 grid gap-2.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            {limits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[0.55rem] size-1 shrink-0 bg-[var(--warning)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="border border-[var(--line-strong)] p-4 sm:p-5 rounded-lg">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Por qué el mismo cm/360 se siente distinto
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            El cm/360 iguala la distancia física de un giro completo, pero la
            imagen en pantalla no es la misma. Un FOV más amplio reparte los
            mismos grados en más píxeles; un zoom cambia la escala; el ADS, el
            recoil y la respuesta del motor añaden diferencias que ninguna
            división puede eliminar.
          </p>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Si el resultado se siente mal, ajusta primero el FOV y los
            multiplicadores del juego. Cambia el cm/360 en pasos pequeños y da
            tiempo a la adaptación. La referencia física es un punto de partida,
            no una garantía de sensación idéntica.
          </p>
        </article>
      </section>

      <section className="mt-8 flex flex-col items-start justify-between gap-4 border-t-2 border-[var(--line)] pt-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            ¿Listo para calcular?
          </h2>
          <p className="mt-1 text-[0.8125rem] text-[var(--muted)]">
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
