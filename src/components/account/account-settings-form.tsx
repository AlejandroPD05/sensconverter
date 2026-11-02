"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/ui/number-field";
import { updateAccountSettings } from "@/app/actions";
import { parseDecimal } from "@/lib/format";
import { cn } from "@/lib/cn";

interface AccountSettingsFormProps {
  displayName: string;
  defaultDpi: number | null;
  globalCm360: number | null;
}

export function AccountSettingsForm({
  displayName,
  defaultDpi,
  globalCm360,
}: AccountSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [dpi, setDpi] = useState(defaultDpi ? String(defaultDpi) : "800");
  const [cm360, setCm360] = useState(globalCm360 ? String(globalCm360) : "40");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setState(null);
    const response = await updateAccountSettings({
      displayName: name.trim(),
      defaultDpi: parseDecimal(dpi),
      globalCm360: parseDecimal(cm360),
    });
    setLoading(false);
    setState({ ok: response.ok, message: response.message });
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="account-name" className="field-label">
          Nombre visible
        </label>
        <input
          id="account-name"
          type="text"
          maxLength={60}
          className="field-input font-sans text-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Cómo quieres aparecer"
        />
        <p className="field-hint">Opcional. Solo se usa dentro de tu cuenta.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="DPI por defecto"
          value={dpi}
          onChange={setDpi}
          unit="DPI"
          step={1}
          min={1}
          max={32000}
          hint="Se usará como valor inicial en la calculadora cuando estés conectado."
        />
        <NumberField
          label="cm/360 global"
          value={cm360}
          onChange={setCm360}
          unit="cm"
          step={1}
          min={1}
          max={200}
          hint="Tu referencia física para girar 360°."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={loading}>
          {state?.ok ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {loading ? "Guardando…" : state?.ok ? "Guardado" : "Guardar ajustes"}
        </Button>
        {state ? (
          <p
            role="status"
            className={cn(
              "text-[0.72rem]",
              state.ok ? "text-[var(--success)]" : "text-[var(--danger)]",
            )}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
