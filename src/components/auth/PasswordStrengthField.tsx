"use client";

import { useEffect, useId, useState } from "react";
import { FieldError } from "@/src/components/ui/FieldError";
import {
  evaluatePasswordCriteria,
  getPasswordStrength,
  PASSWORD_STRENGTH_LABELS,
  PASSWORDS_MISMATCH_MESSAGE,
  type PasswordStrength,
} from "@/src/lib/passwordPolicy";
import { inputClass } from "@/src/lib/ui";

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: "text-red-300",
  medium: "text-amber-200",
  strong: "text-emerald-300",
};

const STRENGTH_BAR: Record<PasswordStrength, string> = {
  weak: "w-1/3 bg-red-400/80",
  medium: "w-2/3 bg-amber-400/80",
  strong: "w-full bg-emerald-400/80",
};

type PasswordStrengthFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: "new-password" | "current-password";
  required?: boolean;
  onPolicyMetChange?: (met: boolean) => void;
};

export function PasswordStrengthField({
  value,
  onChange,
  label = "Şifre",
  autoComplete = "new-password",
  required = true,
  onPolicyMetChange,
}: PasswordStrengthFieldProps) {
  const [focused, setFocused] = useState(false);
  const helpId = useId();

  const criteria = evaluatePasswordCriteria(value);
  const strength = getPasswordStrength(value);
  const showHelp = focused || value.length > 0;
  const policyMet = criteria.every((c) => c.met);

  useEffect(() => {
    onPolicyMetChange?.(policyMet);
  }, [policyMet, onPolicyMetChange]);

  return (
    <div className="relative">
      <span className="mb-1.5 block text-xs text-zinc-400">{label}</span>
      <input
        type="password"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={showHelp ? helpId : undefined}
      />
      {showHelp ? (
        <div
          id={helpId}
          className="mt-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.08] p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
          role="status"
        >
          {strength ? (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-zinc-500">Şifre gücü</span>
                <span className={`font-medium ${STRENGTH_COLORS[strength]}`}>
                  {PASSWORD_STRENGTH_LABELS[strength]}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${STRENGTH_BAR[strength]}`}
                />
              </div>
            </div>
          ) : null}
          <ul className="space-y-1.5 text-xs">
            {criteria.map((item) => (
              <li
                key={item.key}
                className={
                  item.met ? "text-emerald-300/90" : "text-zinc-500"
                }
              >
                <span className="mr-1.5 inline-block w-3 text-center">
                  {item.met ? "✓" : "○"}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type ConfirmPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  password: string;
  showValidation?: boolean;
};

export function ConfirmPasswordField({
  value,
  onChange,
  password,
  showValidation = false,
}: ConfirmPasswordFieldProps) {
  const mismatch =
    value.length > 0 && value !== password
      ? PASSWORDS_MISMATCH_MESSAGE
      : showValidation && value !== password
        ? PASSWORDS_MISMATCH_MESSAGE
        : null;

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs text-zinc-400">Şifre tekrar</span>
      <input
        type="password"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete="new-password"
        aria-invalid={Boolean(mismatch)}
      />
      <FieldError message={mismatch} />
    </label>
  );
}
