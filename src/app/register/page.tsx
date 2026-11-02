import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const next = safeNext(params.next);

  if (user) redirect(next);

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registro opcional. Solo lo necesario para guardar y sincronizar tus perfiles."
      footer={
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      }
    >
      {isSupabaseConfigured ? <AuthForm mode="register" next={next} /> : <SetupNotice />}
    </AuthShell>
  );
}
