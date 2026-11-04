"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { convertSensitivity, type ConversionSuccess } from "@/lib/conversion/engine";
import { formatMeasure, formatSensitivity } from "@/lib/format";

/** Real conversions from the engine, cycled by the hero dial. */
const EXAMPLES = [
  { sourceGameId: "cs2", targetGameId: "valorant", sourceSensitivity: 1 },
  { sourceGameId: "valorant", targetGameId: "overwatch-2", sourceSensitivity: 0.35 },
  { sourceGameId: "apex-legends", targetGameId: "cs2", sourceSensitivity: 2 },
  { sourceGameId: "overwatch-2", targetGameId: "apex-legends", sourceSensitivity: 5 },
]
  .map((pair) =>
    convertSensitivity({ ...pair, sourceDpi: 800, method: "cm360" }),
  )
  .filter((outcome): outcome is ConversionSuccess => outcome.ok);

const CYCLE_MS = 3600;
const TICKS = Array.from({ length: 72 }, (_, index) => index);

export function HeroScope() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Cycle examples only while visible and when motion is allowed.
  useEffect(() => {
    const node = ref.current;
    if (!node || EXAMPLES.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: number | undefined;

    const section = node.closest("section");
    const sync = () => {
      window.clearInterval(timer);
      timer = undefined;
      const running = visible && !reduced.matches && document.visibilityState === "visible";
      section?.toggleAttribute("data-active", running);
      if (running) {
        timer = window.setInterval(
          () => setIndex((current) => (current + 1) % EXAMPLES.length),
          CYCLE_MS,
        );
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  // The reticle drifts toward the pointer while it moves over the hero.
  useEffect(() => {
    const node = ref.current;
    const area = node?.closest("section");
    if (!node || !area) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = node.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
        const dy = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
        node.style.setProperty("--aim-x", `${Math.max(-1, Math.min(1, dx * 2)) * 14}px`);
        node.style.setProperty("--aim-y", `${Math.max(-1, Math.min(1, dy * 2)) * 14}px`);
      });
    };
    const leave = () => {
      node.style.setProperty("--aim-x", "0px");
      node.style.setProperty("--aim-y", "0px");
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, []);

  const current = EXAMPLES[index];
  if (!current) return null;

  const target = formatSensitivity(
    current.targetSensitivityRounded,
    current.targetGame.sensitivity.decimals,
  );
  const source = formatSensitivity(
    current.sourceSensitivity,
    current.sourceGame.sensitivity.decimals,
  );
  const cm360 = formatMeasure(current.sourceCm360, 1);

  return (
    <div
      ref={ref}
      className="hero-scope"
      style={{ "--turn": `${index * 45}deg` } as CSSProperties}
    >
      <svg className="hero-scope__dial" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="97" className="hero-scope__rim" />
        {TICKS.map((tick) => (
          <line
            key={tick}
            x1="100"
            y1="5"
            x2="100"
            y2={tick % 6 === 0 ? 14 : 9}
            className={tick % 6 === 0 ? "hero-scope__tick is-major" : "hero-scope__tick"}
            transform={`rotate(${tick * 5} 100 100)`}
          />
        ))}
      </svg>

      <div className="hero-scope__reticle" aria-hidden="true">
        <span className="hero-scope__line is-h" />
        <span className="hero-scope__line is-v" />
        <span className="hero-scope__dot" />
      </div>

      <div className="hero-scope__readout">
        <p className="hero-scope__from">
          {current.sourceGame.shortName}{" "}
          <span className="mono">
            {source} · {current.sourceDpi} DPI
          </span>
        </p>
        <p className="hero-scope__value mono">
          <RollingNumber value={target} />
        </p>
        <p className="hero-scope__to">en {current.targetGame.shortName}</p>
        <p className="hero-scope__cm mono">
          <RollingNumber value={cm360} /> cm/360
        </p>
        <p className="sr-only">
          Ejemplo: {current.sourceGame.name} {source} a {current.sourceDpi} DPI equivale a{" "}
          {current.targetGame.name} {target}, {cm360} centímetros por giro.
        </p>
      </div>

      <ol className="hero-scope__steps" aria-hidden="true">
        {EXAMPLES.map((example, step) => (
          <li key={example.sourceGame.id} className={step === index ? "is-active" : undefined} />
        ))}
      </ol>
    </div>
  );
}
