export const GLOBAL_STORAGE_KEY = "sensicore.global.v1";

export interface StoredGlobalPreference {
  cm360: number;
  dpi: number;
  gameId: string;
}

type StoredPartial = Partial<StoredGlobalPreference>;

let cached: string | null | undefined;
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return window.localStorage.getItem(GLOBAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getGlobalSnapshot(): string | null {
  if (cached === undefined) cached = read();
  return cached;
}

export function getGlobalServerSnapshot(): string | null {
  return null;
}

export function subscribeGlobal(callback: () => void) {
  listeners.add(callback);

  function handleStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== GLOBAL_STORAGE_KEY) return;
    cached = read();
    callback();
  }

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function parseStoredGlobal(raw: string | null): StoredPartial | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    const result: StoredPartial = {};
    if (typeof value.cm360 === "number" && Number.isFinite(value.cm360) && value.cm360 > 0) {
      result.cm360 = value.cm360;
    }
    if (typeof value.dpi === "number" && Number.isFinite(value.dpi) && value.dpi > 0) {
      result.dpi = value.dpi;
    }
    if (typeof value.gameId === "string" && value.gameId.length > 0) {
      result.gameId = value.gameId;
    }
    return result;
  } catch {
    return null;
  }
}

export function persistGlobal(preference: StoredGlobalPreference): boolean {
  try {
    const raw = JSON.stringify(preference);
    window.localStorage.setItem(GLOBAL_STORAGE_KEY, raw);
    cached = raw;
    for (const listener of listeners) listener();
    return true;
  } catch {
    return false;
  }
}
