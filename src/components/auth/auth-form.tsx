"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "forgot";

const messages: Record<string, string> = {
  "invalid login credentials": "Correo o contraseña incorrectos.",
  "email not confirmed":
    "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
  "user already registered":
    "Ya existe una cuenta con ese correo. Prueba a iniciar sesión.",
  "password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres.",
  "signup requires a valid password": "Introduce una contraseña válida.",
  "email rate limit exceeded":
    "Se han enviado demasiados correos. Espera unos minutos y vuelve a intentarlo.",
  "over_email_send_rate_limit":
    "Se han enviado demasiados correos. Espera unos minutos y vuelve a intentarlo.",
  "for security purposes, you can only request this after 60 seconds.":
    "Por seguridad, espera un minuto antes de volver a solicitar el correo.",
  "error sending confirmation email":
    "El correo de confirmación no se pudo enviar. El envío de correo del proyecto no está configurado; avisa al administrador.",
  "error sending recovery email":
    "El correo de recuperación no se pudo enviar. El envío de correo del proyecto no está configurado; avisa al administrador.",
  "signups not allowed for this instance":
    "El registro está desactivado en este proyecto. No se pueden crear cuentas nuevas.",
  "user not found": "No existe ninguna cuenta con ese correo.",
};

function translate(message: string): string {
  const normalized = message.trim().toLowerCase();
  const known = messages[normalized];
  if (known) return known;

  // Supabase devuelve el dominio rechazado dentro del mensaje.
  if (normalized.startsWith("email address") && normalized.endsWith("is invalid")) {
    return "Esa dirección de correo no es válida para este proyecto. Usa un dominio real; Supabase rechaza dominios de ejemplo como example.com.";
  }

  return message;
}

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase no está configurado en este entorno. Revisa .env.local y reinicia el servidor.",
      );
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (mode === "register" && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) {
          setError(translate(authError.message));
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      if (mode === "register") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (authError) {
          setError(translate(authError.message));
          return;
        }
        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }
        setSuccess(
          "Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.",
        );
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );
      if (authError) {
        setError(translate(authError.message));
        return;
      }
      setSuccess(
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.",
      );
    } catch {
      setError("No se pudo conectar con el servicio de autenticación. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="auth-email" className="field-label">
          Correo electrónico
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          required
          className="field-input font-sans text-sm"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@correo.com"
          aria-invalid={error ? true : undefined}
        />
      </div>

      {mode !== "forgot" ? (
        <div>
          <div className="field-label">
            <label htmlFor="auth-password">Contraseña</label>
            {mode === "login" ? (
              <Link
                href="/forgot-password"
                className="text-xs font-normal tracking-normal text-[var(--fg-soft)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                ¿La olvidaste?
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              minLength={6}
              className="field-input font-sans text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              aria-invalid={error ? true : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-2 grid w-9 place-items-center text-[var(--faint)] transition-colors hover:text-[var(--fg)]"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      ) : null}

      {mode === "register" ? (
        <div>
          <label htmlFor="auth-confirm" className="field-label">
            Repite la contraseña
          </label>
          <input
            id="auth-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            className="field-input font-sans text-sm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Repite la contraseña"
            aria-invalid={error ? true : undefined}
          />
        </div>
      ) : null}

      {error ? (
        <p className="callout callout-danger text-xs leading-relaxed" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="callout callout-success text-xs leading-relaxed" role="status">
          {success}
        </p>
      ) : null}

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {mode === "login"
          ? loading
            ? "Entrando…"
            : "Iniciar sesión"
          : mode === "register"
            ? loading
              ? "Creando cuenta…"
              : "Crear cuenta"
            : loading
              ? "Enviando…"
              : "Enviar enlace"}
      </Button>
    </form>
  );
}
