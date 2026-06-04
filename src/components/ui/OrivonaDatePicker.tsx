"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import {
  buildCalendarMonthCells,
  formatCalendarMonthLabel,
  shiftMonthIso,
  todayIso,
  toDateKey,
} from "@/src/lib/availability";
import { inputClass } from "@/src/lib/ui";

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] as const;

type OrivonaDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  id?: string;
  placeholder?: string;
};

function formatDisplayDate(iso: string): string {
  const key = toDateKey(iso) ?? iso;
  const d = new Date(`${key}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isDisabledDate(date: string, min?: string, max?: string): boolean {
  if (min && date < min) return true;
  if (max && date > max) return true;
  return false;
}

export function OrivonaDatePicker({
  value,
  onChange,
  label,
  required,
  min,
  max,
  className,
  id,
  placeholder = "Tarih seçin",
}: OrivonaDatePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || todayIso());

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const monthLabel = useMemo(
    () => formatCalendarMonthLabel(viewDate),
    [viewDate],
  );
  const cells = useMemo(() => buildCalendarMonthCells(viewDate), [viewDate]);
  const today = todayIso();

  function selectDate(date: string) {
    if (isDisabledDate(date, min, max)) return;
    onChange(date);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {label ? (
        <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      ) : null}
      <button
        type="button"
        id={inputId}
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label ?? "Tarih seç"}
      >
        <span className={value ? "text-white" : "text-zinc-500"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-violet-300/80" aria-hidden />
      </button>
      {required ? (
        <input
          tabIndex={-1}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          value={value}
          required
          onChange={() => {}}
          aria-hidden
        />
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Tarih seçici"
          className="orivona-date-picker-popover absolute left-0 top-full z-[90] mt-2 w-[min(100%,288px)] rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#100818]/98 to-[#08050f]/95 p-4 shadow-[0_16px_48px_-12px_rgba(24,12,48,0.85),inset_0_1px_0_rgba(167,139,250,0.08)] backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-sm text-violet-100 transition hover:bg-violet-500/20"
              onClick={() => setViewDate(shiftMonthIso(viewDate, -1))}
              aria-label="Önceki ay"
            >
              ‹
            </button>
            <p className="text-sm font-semibold capitalize text-white">{monthLabel}</p>
            <button
              type="button"
              className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-sm text-violet-100 transition hover:bg-violet-500/20"
              onClick={() => setViewDate(shiftMonthIso(viewDate, 1))}
              aria-label="Sonraki ay"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-violet-300/70">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell.date) {
                return <span key={`pad-${i}`} className="h-9" />;
              }
              const disabled = isDisabledDate(cell.date, min, max);
              const isSelected = cell.date === value;
              const isToday = cell.date === today;
              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDate(cell.date)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-xs font-medium transition ${
                    disabled
                      ? "cursor-not-allowed border-transparent text-zinc-600 opacity-40"
                      : isSelected
                        ? "border-violet-400/70 bg-violet-500/35 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                        : isToday
                          ? "border-violet-400/35 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
                          : "border-transparent text-zinc-300 hover:border-violet-400/25 hover:bg-violet-500/15 hover:text-violet-50"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-violet-500/15 pt-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:text-white"
              onClick={() => setOpen(false)}
            >
              Kapat
            </button>
            {value ? (
              <button
                type="button"
                className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/20"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Temizle
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
