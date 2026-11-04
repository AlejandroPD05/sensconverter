import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para crear una contraseña nueva. Por seguridad, la respuesta es la misma exista o no la cuenta."
      footer={
        <p>
          <Link href="/login" className="font-semibold text-[var(--fg)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)]">
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {isSupabaseConfigured ? <AuthForm mode="forgot" next="/account" /> : <SetupNotice />}
    </AuthShell>
  );
}
