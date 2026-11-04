import Link from "next/link";
import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/layout/site-header";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="site-container py-8 sm:py-10">
      <div className="grid w-full items-stretch border border-[var(--ink)] lg:grid-cols-[1fr_1.05fr]">
        <aside className="hidden flex-col bg-[var(--ink)] p-8 text-[var(--band-ink)] lg:flex">
          <Brand />
          <div className="mt-auto pt-14">
            <p className="mono text-[0.58rem] uppercase tracking-[0.08em] text-[var(--field)]">
              Cuenta opcional
            </p>
            <h2 className="mt-2 max-w-sm text-3xl font-bold leading-[0.98] tracking-[-0.04em]">
              Guarda tus perfiles.
              <br />
              No tu forma de apuntar.
            </h2>
            <p className="mt-3 max-w-sm text-[0.82rem] leading-relaxed text-[var(--band-muted)]">
              La calculadora es gratis y no necesita cuenta. Si creas una,
              puedes sincronizar tus configuraciones, favoritos y tu cm/360
              global entre dispositivos.
            </p>
            <ul className="mt-6 space-y-2.5 text-[0.78rem] text-[var(--band-ink)]">
              {[
                "Perfiles por juego, DPI y método",
                "Preferencia global de cm/360",
                "Datos privados aislados con RLS",
                "Puedes seguir usando la calculadora sin entrar",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-[var(--field)]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-start gap-2 border-t border-[rgba(233,231,222,0.18)] pt-3 text-[0.68rem] leading-relaxed text-[var(--band-muted)]">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-[var(--field)]"
                aria-hidden="true"
              />
              Autenticación gestionada por Supabase. Nunca almacenamos tu
              contraseña.
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col justify-center bg-[var(--paper-raise)] p-5 sm:p-8">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="mt-6 lg:mt-0">
            <h1 className="display text-[clamp(1.9rem,4vw,2.4rem)]">{title}</h1>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--muted)]">
              {subtitle}
            </p>
          </div>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-[var(--line)] pt-4 text-[0.75rem] text-[var(--muted)]">
            {footer}
          </div>
          <p className="mt-6 text-center text-[0.66rem] text-[var(--faint)]">
            <Link
              href="/"
              className="underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]"
            >
              Volver a la calculadora sin iniciar sesión
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
