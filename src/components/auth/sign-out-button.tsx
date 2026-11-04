"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase no está configurado.");
      setLoading(false);
      return;
    }
    const { error: authError } = await supabase.auth.signOut();
    setLoading(false);
    if (authError) {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <Button variant="secondary" onClick={signOut} disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4" aria-hidden="true" />
        )}
        {loading ? "Cerrando…" : "Cerrar sesión"}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
