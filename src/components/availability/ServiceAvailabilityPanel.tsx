"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchServiceAvailability } from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { VendorAvailability } from "@/src/lib/api/types";
import {
  findAvailabilityOnDate,
  formatAvailabilityDate,
  upcomingAvailability,
} from "@/src/lib/availability";
import { glassCard, inputClass } from "@/src/lib/ui";

type ServiceAvailabilityPanelProps = {
  serviceId: string | number;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

  const selected = findAvailabilityOnDate(items, checkDate);
  const upcoming = upcomingAvailability(items).slice(0, 8);
  const availableUpcoming = upcoming.filter((a) => a.isAvailable !== false);

  return (
    <div className={`${glassCard} space-y-4`}>
      <div>
        <h2 className="text-lg font-semibold text-white">Müsaitlik</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Etkinlik tarihinizi kontrol edin.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-red-300/90">{error}</p>
      ) : (
        <>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">
              Tarih seçin
            </span>
            <input
              type="date"
              className={inputClass}
              value={checkDate}
              min={todayIso()}
              onChange={(e) => setCheckDate(e.target.value)}
            />
          </label>

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
                  ? "Bu tarih uygun"
                  : "Bu tarih dolu"}
              </p>
              {selected.notes?.trim() ? (
                <p className="mt-1.5 text-xs text-zinc-400">{selected.notes}</p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              Bu tarih için müsaitlik bilgisi paylaşılmamış.
            </p>
          )}

          {availableUpcoming.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Yaklaşan uygun tarihler
              </p>
              <ul className="mt-2 space-y-1.5">
                {availableUpcoming.map((a) => (
                  <li
                    key={a.id != null ? String(a.id) : a.date}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-emerald-100/95">
                      {formatAvailabilityDate(a.date)}
                    </span>
                    <span className="text-emerald-300/80">Bu tarih uygun</span>
                    {a.notes?.trim() ? (
                      <span className="w-full text-zinc-500">{a.notes}</span>
                    ) : null}
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
