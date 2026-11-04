import Link from "next/link";
import { Settings2 } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="callout callout-warning" role="status">
      <div className="flex items-start gap-2">
        <Settings2
          className="mt-0.5 size-4 shrink-0 text-[var(--warning)]"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--fg)]">
            Las cuentas no están configuradas en este entorno
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-soft)]">
            La calculadora anónima funciona con normalidad. Para activar el
            registro y el guardado, añade estas variables a{" "}
            <code className="mono border border-[var(--line-strong)] bg-[var(--bg-subtle)] px-1 py-0.5 text-xs rounded">
              .env.local
            </code>{" "}
            y reinicia el servidor:
          </p>
          <pre className="mono mt-2 overflow-x-auto border border-[var(--line-strong)] bg-[var(--bg-subtle)] p-2.5 text-xs leading-relaxed text-[var(--fg-soft)] rounded-lg">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key`}
          </pre>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            Después aplica la migración de{" "}
            <code className="mono">supabase/migrations</code> y configura la URL
            de redirección en Supabase. No se simula ningún inicio de sesión.
          </p>
          <Link href="/" className="btn btn-secondary btn-sm mt-3">
            Volver a la calculadora
          </Link>
        </div>
      </div>
    </div>
  );
}
