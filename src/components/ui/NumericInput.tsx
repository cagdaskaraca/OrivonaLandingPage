"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { inputClass } from "@/src/lib/ui";

function formatDisplay(value: number): string {
  if (value === 0 || Number.isNaN(value)) return "";
  return String(value);
}

function stripLeadingZeros(raw: string): string {
  if (!raw) return "";
  if (raw.includes(".")) {
    const [intPart, dec] = raw.split(".");
    const cleaned = intPart.replace(/^0+(?=\d)/, "") || (dec !== undefined ? "0" : "");
    return dec !== undefined ? `${cleaned}.${dec}` : cleaned;
  }
  if (raw.length > 1 && raw.startsWith("0")) {
    return raw.replace(/^0+/, "") || "";
  }
  return raw;
}

function parseNumeric(raw: string, integerOnly: boolean): number {
  if (!raw.trim() || raw === "-") return 0;
  const n = integerOnly ? parseInt(raw, 10) : parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export type NumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number | string;
  integerOnly?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
};

export function NumericInput({
  value,
  onChange,
  className = inputClass,
  min,
  max,
  step,
  integerOnly = true,
  required,
  disabled,
  placeholder,
  id,
  name,
  "aria-label": ariaLabel,
}: NumericInputProps) {
  const [text, setText] = useState(() => formatDisplay(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatDisplay(value));
    }
  }, [value]);

  const commit = useCallback(
    (raw: string) => {
      const cleaned = stripLeadingZeros(raw);
      let n = parseNumeric(cleaned, integerOnly);
      if (min != null && n < min) n = min;
      if (max != null && n > max) n = max;
      onChange(n);
      setText(n === 0 ? "" : String(n));
    },
    [integerOnly, max, min, onChange],
  );

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode={integerOnly ? "numeric" : "decimal"}
      className={className}
      value={text}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const raw = stripLeadingZeros(e.target.value.replace(/[^\d.-]/g, ""));
        setText(raw);
        if (raw !== "" && raw !== "-") {
          onChange(parseNumeric(raw, integerOnly));
        }
      }}
      onFocus={() => {
        focusedRef.current = true;
        if (text === "0") setText("");
      }}
      onBlur={() => {
        focusedRef.current = false;
        if (text.trim() === "") {
          onChange(0);
          setText("");
          return;
        }
        commit(text);
      }}
    />
  );
}
