"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
const POPOVER_EST_HEIGHT = 340;
const POPOVER_GAP = 8;
const POPOVER_Z = 9020;

type PopoverCoords = {
  top: number;
  left: number;
  width: number;
};

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

function computePopoverCoords(trigger: HTMLElement): PopoverCoords {
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(288, Math.max(rect.width, 260), window.innerWidth - 16);
  let left = rect.left;
  let top = rect.bottom + POPOVER_GAP;

  if (left + width > window.innerWidth - 8) {
    left = window.innerWidth - 8 - width;
  }
  if (left < 8) left = 8;

  if (top + POPOVER_EST_HEIGHT > window.innerHeight - 8) {
    const above = rect.top - POPOVER_GAP - POPOVER_EST_HEIGHT;
    if (above >= 8) top = above;
  }

  return { top, left, width };
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const [viewDate, setViewDate] = useState(value || todayIso());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setCoords(computePopoverCoords(trigger));
  }, []);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updateCoords();
    const onReposition = () => updateCoords();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
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
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => updateCoords());
      }
      return next;
    });
  }

  const popoverPanel = open && coords ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Tarih seçici"
      className="orivona-date-picker-popover fixed rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#100818]/98 to-[#08050f]/95 p-4 shadow-[0_16px_48px_-12px_rgba(24,12,48,0.85),inset_0_1px_0_rgba(167,139,250,0.08)] backdrop-blur-xl"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: POPOVER_Z,
      }}
      onMouseDown={(e) => e.stopPropagation()}
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
          onClick={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
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
              triggerRef.current?.focus();
            }}
          >
            Temizle
          </button>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {label ? (
        <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left`}
        onClick={toggleOpen}
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

      {mounted && popoverPanel
        ? createPortal(popoverPanel, document.body)
        : null}
    </div>
  );
}
