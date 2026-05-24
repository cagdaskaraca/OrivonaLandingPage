"use client";

import { useEffect, useId, useState } from "react";
import { FieldError } from "@/src/components/ui/FieldError";
import {
  PHONE_COUNTRIES,
  formatNationalDisplay,
  normalizeNationalDigits,
  parseStoredPhone,
  toE164Phone,
  validatePhone,
} from "@/src/lib/contactValidation";
import { inputClass, selectClass } from "@/src/lib/ui";

type PhoneFieldProps = {
  value: string;
  onChange: (e164: string) => void;
  required?: boolean;
  disabled?: boolean;
  showValidation?: boolean;
  onValidityChange?: (valid: boolean) => void;
  id?: string;
};

export function PhoneField({
  value,
  onChange,
  required = false,
  disabled,
  showValidation = false,
  onValidityChange,
  id: idProp,
}: PhoneFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const errorId = `${inputId}-error`;
  const [touched, setTouched] = useState(false);

  const parsed = parseStoredPhone(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [nationalDigits, setNationalDigits] = useState(parsed.nationalDigits);

  useEffect(() => {
    const next = parseStoredPhone(value);
    setCountryCode(next.countryCode);
    setNationalDigits(next.nationalDigits);
  }, [value]);

  const display = formatNationalDisplay(countryCode, nationalDigits);
  const validation = validatePhone(countryCode, nationalDigits, required);
  const shouldShow = showValidation || touched;
  const error = shouldShow && !validation.valid ? validation.message : null;

  useEffect(() => {
    onValidityChange?.(validation.valid);
  }, [validation.valid, onValidityChange]);

  function commit(country: string, digits: string) {
    const e164 = toE164Phone(country, digits);
    onChange(e164);
  }

  function handleCountryChange(nextCode: string) {
    setCountryCode(nextCode);
    const trimmed = normalizeNationalDigits(nextCode, nationalDigits);
    setNationalDigits(trimmed);
    commit(nextCode, trimmed);
  }

  function handleDigitsChange(raw: string) {
    const digits = normalizeNationalDigits(countryCode, raw);
    setNationalDigits(digits);
    commit(countryCode, digits);
  }

  const shellClass = `flex flex-1 items-center gap-2 rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm transition-colors focus-within:border-violet-400/40 focus-within:bg-white/[0.06] ${
    error ? "border-red-400/40" : "border-white/10"
  }`;

  return (
    <div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <select
          className={`${selectClass} w-full shrink-0 sm:w-[7.5rem]`}
          value={countryCode}
          disabled={disabled}
          onChange={(e) => handleCountryChange(e.target.value)}
          aria-label="Ülke kodu"
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} +{c.dial}
            </option>
          ))}
        </select>
        <div className={shellClass}>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="tel-national"
            className="min-w-0 w-full border-0 bg-transparent p-0 text-white placeholder:text-zinc-500 outline-none"
            value={display}
            onChange={(e) => handleDigitsChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            placeholder={countryCode === "TR" ? "5XX XXX XX XX" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
