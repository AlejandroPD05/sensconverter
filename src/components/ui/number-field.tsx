"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  hint?: ReactNode;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  id?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  error,
  min,
  max,
  step,
  disabled,
  readOnly,
  placeholder,
  id,
}: NumberFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <div className="field-label">
        <label htmlFor={inputId}>{label}</label>
        {unit ? <span className="mono text-[0.68rem] text-[var(--faint)]">{unit}</span> : null}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          className={cn("field-input", unit ? "pr-14" : undefined, readOnly && "opacity-70")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {unit ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[0.7rem] font-medium tracking-wide text-[var(--faint)]"
          >
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
