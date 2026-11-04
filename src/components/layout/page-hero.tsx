import type { ReactNode } from "react";

/** Compact dark page header shared by the content pages. */
export function PageHero({ lines, children }: { lines: string[]; children?: ReactNode }) {
  return (
    <section className="hero-dark" aria-labelledby="page-title">
      <div className="hero-aurora" aria-hidden="true" />
      <div className="site-container grid gap-6 pb-14 pt-12 sm:pt-16 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end">
        <h1 id="page-title" className="hero-title hero-title--page">
          {lines.map((line, index) => (
            <span key={line} className="reveal-line">
              <span className={index === lines.length - 1 ? "text-[var(--hero-accent)]" : undefined}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        {children ? (
          <div className="hero-lede hero-fade max-w-md text-[0.95rem] leading-relaxed md:justify-self-end">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
