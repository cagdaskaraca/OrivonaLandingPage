"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchServiceAvailability } from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { VendorAvailability } from "@/src/lib/api/types";
import {
  availabilityStatusMap,
  findAvailabilityOnDate,
  todayIso,
  upcomingAvailability,
} from "@/src/lib/availability";
import { OrivonaAvailabilityCalendar } from "@/src/components/availability/OrivonaAvailabilityCalendar";
import { glassCard } from "@/src/lib/ui";

type ServiceAvailabilityPanelProps = {
  serviceId: string | number;
};

export function ServiceAvailabilityPanel({
  serviceId,
}: ServiceAvailabilityPanelProps) {
  const [items, setItems] = useState<VendorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkDate, setCheckDate] = useState(todayIso());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchServiceAvailability(serviceId);
      setItems(list);
    } catch (err) {
      logApiError("Service availability fetch failed", err);
      setError(formatUiErrorMessage(err, "Müsaitlik bilgisi yüklenemedi."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  const datesWithStatus = useMemo(() => availabilityStatusMap(items), [items]);
  const selected = findAvailabilityOnDate(items, checkDate);
  const availableUpcoming = upcomingAvailability(items)
    .filter((a) => a.isAvailable !== false)
    .slice(0, 6);

  return (
    <div className={`${glassCard} space-y-4`}>
      <div>
        <h2 className="text-lg font-semibold text-white">Müsaitlik</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Takvimden bir tarih seçerek müsaitliği kontrol edin.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-red-300/90">{error}</p>
      ) : (
        <>
          <OrivonaAvailabilityCalendar
            selectedDate={checkDate}
            onSelectDate={setCheckDate}
            datesWithStatus={datesWithStatus}
          />

          {selected ? (
            <div
              className={`rounded-xl border px-4 py-3 ${
                selected.isAvailable !== false
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-red-400/30 bg-red-500/10"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  selected.isAvailable !== false
                    ? "text-emerald-200"
                    : "text-red-200"
                }`}
              >
                {selected.isAvailable !== false
                  ? "Bu tarih müsait"
                  : "Bu tarih dolu"}
              </p>
              {selected.notes?.trim() ? (
                <p className="mt-1.5 text-xs text-zinc-400">{selected.notes}</p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 text-sm text-zinc-400">
              Bu tarih için müsaitlik bilgisi paylaşılmamış.
            </p>
          )}

          {availableUpcoming.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Yaklaşan müsait tarihler
              </p>
              <ul className="mt-2 space-y-1.5">
                {availableUpcoming.map((a) => (
                  <li
                    key={a.id != null ? String(a.id) : a.date}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-xs text-emerald-100/95"
                  >
                    {a.date}
                    {a.notes?.trim() ? ` · ${a.notes}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : items.length === 0 ? (
            <p className="text-xs text-zinc-500">
              Henüz müsaitlik takvimi eklenmemiş.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
