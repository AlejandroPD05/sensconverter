"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOwnAccount } from "@/app/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const CONFIRMATION = "ELIMINAR";

export function DeleteAccountForm() {
  const router = useRouter();
  const inputId = useId();
  const hintId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (value !== CONFIRMATION) return;
    setLoading(true);
    setError(null);
    const response = await deleteOwnAccount(value);
    if (!response.ok) {
      setLoading(false);
      setError(response.message);
      return;
    }
    // El servidor ya cerró la sesión; esto limpia también el estado del navegador.
    await getSupabaseBrowserClient()?.auth.signOut();
    router.push("/?cuenta=eliminada");
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        Eliminar mi cuenta
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label htmlFor={inputId} className="field-label">
          Escribe {CONFIRMATION} para confirmar
        </label>
        <input
          id={inputId}
          className="field-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          autoFocus
          aria-describedby={hintId}
          spellCheck={false}
        />
        <p id={hintId} className="field-hint">
          Se borran tu cuenta, tus perfiles y tus preferencias. No se puede
          deshacer.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="danger"
          disabled={value !== CONFIRMATION || loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          {loading ? "Eliminando…" : "Eliminar definitivamente"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => {
            setOpen(false);
            setValue("");
            setError(null);
          }}
        >
          Cancelar
        </Button>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
