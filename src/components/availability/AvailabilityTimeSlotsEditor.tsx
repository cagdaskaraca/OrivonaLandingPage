"use client";

import type { AvailabilityTimeSlot } from "@/src/lib/availability";
import { newTimeSlot } from "@/src/lib/availability";
import { btnSecondary, inputClass } from "@/src/lib/ui";

type AvailabilityTimeSlotsEditorProps = {
  slots: AvailabilityTimeSlot[];
  onChange: (slots: AvailabilityTimeSlot[]) => void;
};

export function AvailabilityTimeSlotsEditor({
  slots,
  onChange,
}: AvailabilityTimeSlotsEditorProps) {
  function updateSlot(id: string, patch: Partial<AvailabilityTimeSlot>) {
    onChange(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSlot(id: string) {
    onChange(slots.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-violet-100/95">
          Saat aralıkları (isteğe bağlı)
        </p>
        <button
          type="button"
          className={`${btnSecondary} px-3 py-1 text-xs`}
          onClick={() => onChange([...slots, newTimeSlot()])}
        >
          + Aralık ekle
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Günlük genel duruma ek olarak saat bazlı müsaitlik tanımlayabilirsiniz.
        Sunucu henüz desteklemiyorsa yalnızca bu cihazda saklanır.
      </p>
      {slots.length === 0 ? (
        <p className="text-xs text-zinc-600">Saat aralığı eklenmedi.</p>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <label className="block text-xs">
                <span className="mb-1 block text-zinc-500">Başlangıç saati</span>
                <input
                  type="time"
                  className={`${inputClass} [color-scheme:dark]`}
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(slot.id, { startTime: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block text-zinc-500">Bitiş saati</span>
                <input
                  type="time"
                  className={`${inputClass} [color-scheme:dark]`}
                  value={slot.endTime}
                  onChange={(e) =>
                    updateSlot(slot.id, { endTime: e.target.value })
                  }
                />
              </label>
              <div className="block text-xs sm:col-span-2">
                <span className="mb-1 block text-zinc-500">Durum</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      slot.isAvailable
                        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/35"
                        : "border border-white/10 text-zinc-500"
                    }`}
                    onClick={() => updateSlot(slot.id, { isAvailable: true })}
                  >
                    Müsait
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      !slot.isAvailable
                        ? "bg-red-500/15 text-red-200 ring-1 ring-red-400/30"
                        : "border border-white/10 text-zinc-500"
                    }`}
                    onClick={() => updateSlot(slot.id, { isAvailable: false })}
                  >
                    Dolu
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={`${btnSecondary} self-end px-2 py-1 text-xs sm:col-span-4 sm:justify-self-end`}
                onClick={() => removeSlot(slot.id)}
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
