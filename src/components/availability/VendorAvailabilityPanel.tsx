"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createVendorAvailability,
  deleteVendorAvailability,
  fetchVendorAvailability,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { VendorAvailability } from "@/src/lib/api/types";
import { AvailabilityTimeSlotsEditor } from "@/src/components/availability/AvailabilityTimeSlotsEditor";
import { OrivonaAvailabilityCalendar } from "@/src/components/availability/OrivonaAvailabilityCalendar";
import {
  type AvailabilityTimeSlot,
  availabilityStatusMap,
  findAvailabilityOnDate,
  formatShortAvailabilityDate,
  isAvailabilityEntryAvailable,
  mergeAvailabilityItem,
  newTimeSlot,
  toDateKey,
  todayIso,
} from "@/src/lib/availability";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

function slotsFromSaved(item?: VendorAvailability): AvailabilityTimeSlot[] {
  if (!item?.timeSlots?.length) return [];
  return item.timeSlots.map((s, i) =>
    newTimeSlot({
      id: `saved-${i}-${s.startTime}-${s.endTime}`,
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable !== false,
    }),
  );
}

function applyFormFromSaved(
  item: VendorAvailability | undefined,
  localSlots: AvailabilityTimeSlot[] | undefined,
): {
  isAvailable: boolean;
  notes: string;
  timeSlots: AvailabilityTimeSlot[];
} {
  if (!item) {
    return { isAvailable: true, notes: "", timeSlots: localSlots ?? [] };
  }
  return {
    isAvailable: isAvailabilityEntryAvailable(item),
    notes: item.notes ?? "",
    timeSlots:
      localSlots !== undefined && localSlots.length > 0
        ? localSlots
        : slotsFromSaved(item),
  };
}

export function VendorAvailabilityPanel() {
  const [items, setItems] = useState<VendorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingId, setResettingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState("");
  const [timeSlots, setTimeSlots] = useState<AvailabilityTimeSlot[]>([]);
  /** Frontend-only slots when API does not return timeSlots */
  const [localSlotsByDate, setLocalSlotsByDate] = useState<
    Record<string, AvailabilityTimeSlot[]>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchVendorAvailability();
      setItems(list);
    } catch (err) {
      logApiError("Vendor availability fetch failed", err);
      setError(formatUiErrorMessage(err, "Müsaitlik yüklenemedi."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const datesWithStatus = useMemo(() => availabilityStatusMap(items), [items]);

  const syncFormToDate = useCallback(
    (date: string, list: VendorAvailability[]) => {
      const key = toDateKey(date) ?? date;
      const saved = findAvailabilityOnDate(list, key);
      const local = localSlotsByDate[key];
      const next = applyFormFromSaved(saved, local);
      setIsAvailable(next.isAvailable);
      setNotes(next.notes);
      setTimeSlots(next.timeSlots);
    },
    [localSlotsByDate],
  );

  useEffect(() => {
    syncFormToDate(selectedDate, items);
  }, [selectedDate, items, syncFormToDate]);

  function handleSelectDate(date: string) {
    const key = toDateKey(date) ?? date;
    setSelectedDate(key);
    syncFormToDate(key, items);
  }

  function handleTimeSlotsChange(slots: AvailabilityTimeSlot[]) {
    const key = toDateKey(selectedDate) ?? selectedDate;
    setTimeSlots(slots);
    setLocalSlotsByDate((prev) => ({ ...prev, [key]: slots }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const key = toDateKey(selectedDate) ?? selectedDate;
    if (!key) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const hasBackendSlots = false;
      const saved = await createVendorAvailability({
        date: key,
        isAvailable,
        status: isAvailable ? "available" : "unavailable",
        notes: notes.trim() || undefined,
        ...(hasBackendSlots && timeSlots.length > 0
          ? {
              timeSlots: timeSlots.map((s) => ({
                startTime: s.startTime,
                endTime: s.endTime,
                isAvailable: s.isAvailable,
                status: s.isAvailable ? "available" : "unavailable",
              })),
            }
          : {}),
      });
      setItems((prev) => mergeAvailabilityItem(prev, saved));
      if (timeSlots.length > 0) {
        setLocalSlotsByDate((prev) => ({ ...prev, [key]: timeSlots }));
      }
      setSuccess(
        isAvailable
          ? "Tarih müsait olarak kaydedildi."
          : "Tarih dolu olarak kaydedildi.",
      );
      await load();
    } catch (err) {
      logApiError("Vendor availability create failed", err);
      setError(formatUiErrorMessage(err, "Kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleReset(id: string | number, date?: string) {
    setResettingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteVendorAvailability(id);
      const key = toDateKey(date);
      if (key) {
        setLocalSlotsByDate((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      setSuccess("Tarih sıfırlandı — müsaitlik kaydı kaldırıldı.");
      await load();
      if (key && toDateKey(selectedDate) === key) {
        setIsAvailable(true);
        setNotes("");
        setTimeSlots([]);
      }
    } catch (err) {
      logApiError("Vendor availability reset failed", err);
      setError(formatUiErrorMessage(err, "Sıfırlanamadı."));
    } finally {
      setResettingId(null);
    }
  }

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) =>
        (toDateKey(b.date) ?? "").localeCompare(toDateKey(a.date) ?? ""),
      ),
    [items],
  );

  return (
    <div className={`${glassCard} mb-8`}>
      <h2 className="text-lg font-semibold text-white">Müsaitlik takvimi</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Takvimden bir tarih seçin, müsait veya dolu olarak kaydedin. Aynı tarihi
        tekrar kaydettiğinizde kayıt güncellenir; müşteri hizmet detayında
        güncel durumu görür.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">Yükleniyor…</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <OrivonaAvailabilityCalendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            datesWithStatus={datesWithStatus}
          />

          <form onSubmit={handleSave} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">
                Seçili tarih
              </span>
              <input
                type="date"
                className={`${inputClass} [color-scheme:dark]`}
                value={selectedDate}
                min={todayIso()}
                onChange={(e) => handleSelectDate(e.target.value)}
                required
              />
            </label>
            <div className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Durum</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isAvailable
                      ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                      : "border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                  onClick={() => setIsAvailable(true)}
                >
                  Müsait
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !isAvailable
                      ? "bg-red-500/15 text-red-200 ring-1 ring-red-400/35"
                      : "border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                  onClick={() => setIsAvailable(false)}
                >
                  Dolu
                </button>
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Not</span>
              <input
                type="text"
                className={inputClass}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn. Sadece akşam…"
                maxLength={500}
              />
            </label>
            <AvailabilityTimeSlotsEditor
              slots={timeSlots}
              onChange={handleTimeSlotsChange}
            />
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </form>
        </div>
      )}

      {success ? (
        <p className="mt-4 text-sm text-emerald-300/90">{success}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-300/90">{error}</p> : null}

      <div className="mt-8 border-t border-violet-500/15 pt-6">
        <h3 className="text-sm font-semibold text-white">Kayıtlı tarihler</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Durumu değiştirmek için tarihe tıklayın ve Müsait veya Dolu olarak
          kaydedin.
        </p>
        {loading ? null : sortedItems.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Henüz müsaitlik kaydı yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.02]">
            {sortedItems.map((item) => {
              if (item.id == null || !item.date) return null;
              const key = toDateKey(item.date) ?? item.date;
              const available = isAvailabilityEntryAvailable(item);
              const isSelected = toDateKey(selectedDate) === key;
              const isResetting = resettingId === item.id;
              return (
                <li
                  key={String(item.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 transition first:rounded-t-xl last:rounded-b-xl ${
                    isSelected ? "bg-violet-500/[0.08]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handleSelectDate(key)}
                  >
                    <p className="text-sm font-medium text-zinc-100">
                      {formatShortAvailabilityDate(key)}
                    </p>
                    {item.notes?.trim() ? (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {item.notes}
                      </p>
                    ) : null}
                  </button>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      available
                        ? "bg-emerald-500/15 text-emerald-200/90 ring-1 ring-emerald-400/25"
                        : "bg-red-500/12 text-red-200/90 ring-1 ring-red-400/20"
                    }`}
                  >
                    {available ? "Müsait" : "Dolu"}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-zinc-600 transition hover:text-zinc-300 disabled:opacity-40 sm:opacity-60 sm:group-hover:opacity-100"
                    disabled={isResetting}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleReset(item.id!, key);
                    }}
                    title="Bu tarih için müsaitlik kaydını kaldır"
                  >
                    {isResetting ? "…" : "Sıfırla"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
