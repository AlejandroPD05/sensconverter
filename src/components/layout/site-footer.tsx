import Link from "next/link";
import { Coffee } from "lucide-react";
import { brand, donation } from "@/lib/brand";

const groups = [
  {
    title: "Herramienta",
    links: [
      { href: "/", label: "Calculadora" },
      { href: "/global", label: "Sensibilidad global" },
      { href: "/games", label: "Biblioteca de juegos" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/my-sensitivities", label: "Mis sensibilidades" },
      { href: "/account", label: "Cuenta" },
      { href: "/methodology", label: "Metodología" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-16 border-t border-[var(--line)] bg-[var(--bg-subtle)]">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="text-sm font-semibold tracking-[-0.01em]">
            {brand.name}
          </p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Conversor de sensibilidad con fórmulas documentadas. Sin cuenta
            obligatoria, sin resultados inventados. La sensación de apuntado
            depende de más factores que cm/360.
          </p>
          {donation.url ? (
            <a
              href={donation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm mt-4"
              data-testid="donation-link"
            >
              <Coffee className="size-4" aria-hidden="true" />
              Apóyalo en {donation.provider}
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          ) : null}
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <p className="label">{group.title}</p>
            <ul className="mt-3 grid gap-1.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-[var(--fg-soft)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--line)] text-[var(--faint)]">
        <div className="site-container flex flex-col gap-1.5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name} · herramienta independiente
          </p>
          <p>Constantes verificadas el 29/10/2026 · revisa siempre en tu juego</p>
        </div>
      </div>
    </footer>
  );
}
