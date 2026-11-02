export function formatSensitivity(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(decimals);
}

export function formatMeasure(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function formatDpi(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return Number.NaN;
  return Number(normalized);
}


export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
