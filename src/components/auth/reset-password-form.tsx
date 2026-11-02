"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase no está configurado en este entorno.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (authError) {
      setError(
        authError.message === "Auth session missing!"
          ? "El enlace ha caducado o no es válido. Solicita uno nuevo."
          : authError.message,
      );
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="callout callout-success" role="status">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#a7f3d0]">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Contraseña actualizada
        </p>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--text-soft)]">
          Ya puedes usar tu nueva contraseña. Tu sesión actual sigue activa.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/account" className="btn btn-primary btn-sm">
            Ir a mi cuenta
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm">
            Calculadora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reset-password" className="field-label">
          Nueva contraseña
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="field-input font-sans text-sm"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="field-label">
          Repite la nueva contraseña
        </label>
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="field-input font-sans text-sm"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Repite la contraseña"
        />
      </div>

      {error ? (
        <p className="callout callout-danger text-[0.76rem] leading-relaxed" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? "Guardando…" : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
