"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createVendorAvailability,
  deleteVendorAvailability,
  fetchVendorAvailability,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { VendorAvailability } from "@/src/lib/api/types";
import {
  availabilityStatusMap,
  formatAvailabilityDate,
  todayIso,
} from "@/src/lib/availability";
import { OrivonaAvailabilityCalendar } from "@/src/components/availability/OrivonaAvailabilityCalendar";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

export function VendorAvailabilityPanel() {
  const [items, setItems] = useState<VendorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState("");

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createVendorAvailability({
        date: selectedDate,
        isAvailable,
        notes: notes.trim() || undefined,
      });
      setSuccess(
        isAvailable
          ? "Tarih müsait olarak kaydedildi."
          : "Tarih dolu olarak kaydedildi.",
      );
      setNotes("");
      await load();
    } catch (err) {
      logApiError("Vendor availability create failed", err);
      setError(formatUiErrorMessage(err, "Kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteVendorAvailability(id);
      setSuccess("Kayıt silindi.");
      await load();
    } catch (err) {
      logApiError("Vendor availability delete failed", err);
      setError(formatUiErrorMessage(err, "Silinemedi."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={`${glassCard} mb-8`}>
      <h2 className="text-lg font-semibold text-white">Müsaitlik takvimi</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Tarihleri müsait veya dolu olarak işaretleyin; müşteri hizmet detayında
        aynı takvimi görür.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">Yükleniyor…</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <OrivonaAvailabilityCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
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
                onChange={(e) => setSelectedDate(e.target.value)}
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

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-white">Kayıtlı tarihler</h3>
        {loading ? null : items.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Henüz müsaitlik kaydı yok.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((item) => {
              if (item.id == null || !item.date) return null;
              const available = item.isAvailable !== false;
              return (
                <li
                  key={String(item.id)}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {formatAvailabilityDate(item.date)}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        available ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {available ? "Müsait" : "Dolu"}
                    </p>
                    {item.notes?.trim() ? (
                      <p className="mt-1 text-xs text-zinc-400">{item.notes}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={`${btnSecondary} shrink-0 px-3 py-1.5 text-xs`}
                    disabled={deletingId === item.id}
                    onClick={() => void handleDelete(item.id!)}
                  >
                    {deletingId === item.id ? "…" : "Sil"}
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
