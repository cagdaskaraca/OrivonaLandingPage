"use client";

import { useEffect, useId, useState } from "react";
import { FieldError } from "@/src/components/ui/FieldError";
import {
  EMAIL_INVALID_MESSAGE,
  isValidEmail,
} from "@/src/lib/contactValidation";
import { inputClass } from "@/src/lib/ui";

type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  /** Show validation after blur or when true (e.g. submit attempt). */
  showValidation?: boolean;
  onValidityChange?: (valid: boolean) => void;
  id?: string;
};

export function EmailField({
  value,
  onChange,
  required = false,
  disabled,
  readOnly,
  placeholder = "ornek@mail.com",
  className = inputClass,
  showValidation = false,
  onValidityChange,
  id: idProp,
}: EmailFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const errorId = `${inputId}-error`;
  const [touched, setTouched] = useState(false);

  const shouldShow = showValidation || touched;
  const hasValue = value.trim().length > 0;
  const valid =
    (!required && !hasValue) || (hasValue && isValidEmail(value));
  const error =
    shouldShow && !valid
      ? EMAIL_INVALID_MESSAGE
      : shouldShow && required && !hasValue
        ? EMAIL_INVALID_MESSAGE
        : null;

  useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  return (
    <div>
      <input
        id={inputId}
        type="email"
        inputMode="email"
        autoComplete="email"
        className={`${className} ${error ? "border-red-400/40" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
