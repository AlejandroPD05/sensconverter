/**
 * Lectura en directo de la calculadora.
 *
 * La franja del encabezado enseña la conversión actual sin duplicar estado:
 * la calculadora publica aquí su resultado y cualquier superficie suscrita
 * lo lee. Sin Supabase, sin almacenamiento y sin datos inventados.
 */

export interface LiveReadout {
  sourceShort: string;
  sourceSensitivity: string;
  sourceDpi: number;
  targetShort: string;
  targetSensitivity: string;
  cm360: number;
  edpi: number;
}

let current: LiveReadout | null = null;
const listeners = new Set<() => void>();

export function publishLiveReadout(next: LiveReadout | null) {
  current = next;
  for (const listener of listeners) listener();
}

export function subscribeLiveReadout(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLiveReadoutSnapshot() {
  return current;
}

export function getLiveReadoutServerSnapshot(): LiveReadout | null {
  return null;
}
