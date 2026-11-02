import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/[0.06] py-10">
      <div className="site-container flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-sm font-semibold tracking-[-0.02em]">{brand.name}</p>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--faint)]">
            Conversor de sensibilidad con fórmulas documentadas. Sin cuenta
            obligatoria, sin resultados inventados. La sensación de apuntado
            depende de más factores que cm/360.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[0.78rem] text-[var(--muted)] sm:grid-cols-3">
          <Link href="/" className="transition-colors hover:text-white">
            Calculadora
          </Link>
          <Link href="/games" className="transition-colors hover:text-white">
            Biblioteca
          </Link>
          <Link href="/global" className="transition-colors hover:text-white">
            Sensibilidad global
          </Link>
          <Link href="/methodology" className="transition-colors hover:text-white">
            Metodología
          </Link>
          <Link href="/account" className="transition-colors hover:text-white">
            Cuenta
          </Link>
          <Link href="/my-sensitivities" className="transition-colors hover:text-white">
            Mis sensibilidades
          </Link>
        </div>
      </div>
      <div className="site-container mt-8 flex flex-col gap-2 border-t border-white/[0.05] pt-5 text-[0.68rem] text-[var(--faint)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {brand.name}. Herramienta independiente.</p>
        <p>
          Constantes verificadas el 29/10/2026. Verifica siempre en el rango de
          práctica de tu juego.
        </p>
      </div>
    </footer>
  );
}
