import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthErrorNotice } from "@/components/auth/auth-error-notice";
import { AuthForm } from "@/components/auth/auth-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const next = safeNext(params.next);
  const error = typeof params.error === "string" ? params.error : undefined;

  if (user) redirect(next);

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede para sincronizar tus perfiles y tu referencia global. La calculadora no necesita cuenta."
      footer={
        <p>
          ¿No tienes cuenta?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Crear una cuenta
          </Link>
        </p>
      }
    >
      <AuthErrorNotice code={error} />
      {isSupabaseConfigured ? <AuthForm mode="login" next={next} /> : <SetupNotice />}
    </AuthShell>
  );
}
