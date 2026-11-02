import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
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
    <div className="site-container flex min-h-[calc(100dvh-14rem)] items-center py-10 sm:py-14">
      <div className="grid w-full items-stretch gap-4 lg:grid-cols-[1fr_1.05fr]">
        <aside className="glass relative hidden overflow-hidden p-8 lg:flex lg:flex-col">
          <div
            className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-[var(--accent)]/10 blur-3xl"
            aria-hidden="true"
          />
          <Brand />
          <div className="mt-auto">
            <p className="eyebrow">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Cuenta opcional
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.04em]">
              Guarda tus perfiles. No tu forma de apuntar.
            </h2>
            <p className="mt-3 max-w-sm text-[0.82rem] leading-relaxed text-[var(--muted)]">
              La calculadora es gratis y no necesita cuenta. Si creas una,
              puedes sincronizar tus configuraciones, favoritos y tu cm/360
              global entre dispositivos.
            </p>
            <ul className="mt-6 space-y-3 text-[0.78rem] text-[var(--text-soft)]">
              {[
                "Perfiles por juego, DPI y método",
                "Preferencia global de cm/360",
                "Datos privados aislados con RLS",
                "Puedes seguir usando la calculadora sin entrar",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[0.68rem] text-[var(--faint)]">
              <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
              Autenticación gestionada por Supabase. Nunca almacenamos tu
              contraseña.
            </div>
          </div>
        </aside>

        <section className="glass flex min-w-0 flex-col justify-center p-5 sm:p-8">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="mt-6 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-[var(--muted)]">
              {subtitle}
            </p>
          </div>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-white/[0.06] pt-4 text-[0.75rem] text-[var(--muted)]">
            {footer}
          </div>
          <p className="mt-6 text-center text-[0.66rem] text-[var(--faint)]">
            <Link href="/" className="hover:text-white">
              Volver a la calculadora sin iniciar sesión
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
