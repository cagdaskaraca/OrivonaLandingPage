"use client";

import { useMemo, useState } from "react";
import {
  buildCalendarMonthCells,
  formatCalendarMonthLabel,
  shiftMonthIso,
  todayIso,
} from "@/src/lib/availability";

type OrivonaAvailabilityCalendarProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** date ISO -> available (true) / full (false). Missing = no data. */
  datesWithStatus: Map<string, boolean>;
  className?: string;
};

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] as const;

export function OrivonaAvailabilityCalendar({
  selectedDate,
  onSelectDate,
  datesWithStatus,
  className = "",
}: OrivonaAvailabilityCalendarProps) {
  const [viewDate, setViewDate] = useState(selectedDate || todayIso());
  const today = todayIso();

  const monthLabel = useMemo(
    () => formatCalendarMonthLabel(viewDate),
    [viewDate],
  );
  const cells = useMemo(() => buildCalendarMonthCells(viewDate), [viewDate]);

  function goMonth(delta: number) {
    setViewDate(shiftMonthIso(viewDate, delta));
  }

  return (
    <div
      className={`rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#100818]/95 to-[#08050f]/95 p-4 shadow-[inset_0_1px_0_rgba(167,139,250,0.08)] ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-sm text-violet-100 transition hover:bg-violet-500/20"
          onClick={() => goMonth(-1)}
          aria-label="Önceki ay"
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize text-white">{monthLabel}</p>
        <button
          type="button"
          className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-sm text-violet-100 transition hover:bg-violet-500/20"
          onClick={() => goMonth(1)}
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
            return <span key={`pad-${i}`} className="h-10" />;
          }
          const status = datesWithStatus.get(cell.date);
          const hasStatus = status !== undefined;
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === today;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`relative flex h-10 flex-col items-center justify-center rounded-lg border text-xs font-medium transition ${
                status === true
                  ? "bg-emerald-500/15 text-emerald-50/95"
                  : status === false
                    ? "bg-red-500/12 text-red-100/95"
                    : isToday
                      ? "border-violet-400/35 bg-violet-500/10 text-violet-100"
                      : "border-transparent text-zinc-300 hover:border-violet-400/20 hover:bg-white/[0.04]"
              } ${
                isSelected
                  ? "z-[1] border-violet-400/70 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] ring-2 ring-violet-400/55 ring-offset-1 ring-offset-[#08050f]"
                  : isToday && hasStatus
                    ? "border-violet-400/25"
                    : ""
              }`}
            >
              {cell.day}
              {status !== undefined ? (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    status ? "bg-emerald-400" : "bg-red-400"
                  }`}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-violet-500/15 pt-3 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded border border-emerald-400/40 bg-emerald-500/30" />
          Müsait
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded border border-red-400/35 bg-red-500/25" />
          Dolu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded border border-violet-400/50 bg-violet-500/25 ring-1 ring-violet-400/30" />
          Seçili
        </span>
      </div>
    </div>
  );
}
