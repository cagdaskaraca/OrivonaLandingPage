"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import "./invitation-studio.css";

export type StudioSelectOption = {
  value: string;
  label: string;
};

type InvitationStudioSelectProps = {
  value: string;
  options: StudioSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function InvitationStudioSelect({
  value,
  options,
  onChange,
  placeholder = "Seçin",
  disabled,
}: InvitationStudioSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="invitation-studio-select" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        className="invitation-studio-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className="shrink-0 opacity-70" />
      </button>
      {open ? (
        <div className="invitation-studio-select-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              data-selected={opt.value === value ? "true" : undefined}
              aria-selected={opt.value === value}
              className="invitation-studio-select-option"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
