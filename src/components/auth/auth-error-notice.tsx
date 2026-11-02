import { AlertTriangle } from "lucide-react";

const messages: Record<string, string> = {
  auth_callback:
    "No se pudo completar el enlace. Puede haber caducado, haberse usado ya o haberse abierto en otro navegador. Inicia sesión o solicita uno nuevo.",
};

export function AuthErrorNotice({ code }: { code?: string }) {
  if (!code) return null;

  const message =
    messages[code] ??
    "No se pudo completar la operación. Inicia sesión o solicita un enlace nuevo.";

  return (
    <p className="callout callout-warning mb-4 text-[0.76rem] leading-relaxed" role="alert">
      <AlertTriangle
        className="mr-1.5 inline size-3.5 shrink-0 text-[#fde68a]"
        aria-hidden="true"
      />
      {message}
    </p>
  );
}
