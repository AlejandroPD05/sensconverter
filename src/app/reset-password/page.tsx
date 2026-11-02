import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage() {
  const configured = isSupabaseConfigured;
  const user = configured ? await getCurrentUser() : null;

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña que no uses en otros servicios."
      footer={
        <p>
          <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {!configured ? (
        <SetupNotice />
      ) : user ? (
        <ResetPasswordForm />
      ) : (
        <div className="callout callout-warning" role="alert">
          <p className="text-sm font-semibold text-[#fde68a]">
            El enlace no es válido o ha caducado
          </p>
          <p className="mt-1.5 text-[0.76rem] leading-relaxed text-[var(--text-soft)]">
            Solicita un enlace nuevo desde la página de recuperación. Los
            enlaces de Supabase caducan y solo pueden usarse una vez.
          </p>
          <Link href="/forgot-password" className="btn btn-secondary btn-sm mt-3">
            Pedir otro enlace
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
