"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createVendorAvailability,
  deleteVendorAvailability,
  fetchVendorAvailability,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { VendorAvailability } from "@/src/lib/api/types";
import { formatAvailabilityDate } from "@/src/lib/availability";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

  const datesWithStatus = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of items) {
      if (item.date) map.set(item.date, item.isAvailable !== false);
    }
    return map;
  }, [items]);

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

  const monthLabel = useMemo(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const base = new Date(`${selectedDate}T12:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: string; day: number }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: "", day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: iso, day: d });
    }
    return cells;
  }, [selectedDate]);

  return (
    <div className={`${glassCard} mb-8`}>
      <h2 className="text-lg font-semibold text-white">Müsaitlik takvimi</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Tarihleri müsait veya dolu olarak işaretleyin; not ekleyebilirsiniz.
      </p>

      <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-xs text-zinc-400">Tarih</span>
          <input
            type="date"
            className={inputClass}
            value={selectedDate}
            min={todayIso()}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </label>
        <div className="block text-sm sm:col-span-2 lg:col-span-1">
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
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">Not</span>
          <input
            type="text"
            className={inputClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Örn. Sadece akşam, minimum 150 kişi…"
            maxLength={500}
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>

      {success ? (
        <p className="mt-4 text-sm text-emerald-300/90">{success}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-300/90">{error}</p>
      ) : null}

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {monthLabel} özeti
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-500">
          {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => {
            if (!cell.date) {
              return <span key={`pad-${i}`} />;
            }
            const status = datesWithStatus.get(cell.date);
            const isSelected = cell.date === selectedDate;
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelectedDate(cell.date)}
                className={`flex h-9 flex-col items-center justify-center rounded-lg text-xs transition ${
                  isSelected
                    ? "ring-2 ring-violet-400/50"
                    : "hover:bg-white/[0.06]"
                } ${
                  status === true
                    ? "bg-emerald-500/15 text-emerald-100"
                    : status === false
                      ? "bg-red-500/10 text-red-200/90"
                      : "text-zinc-400"
                }`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500/40" />
            Müsait
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-red-500/35" />
            Dolu
          </span>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-white">Kayıtlı tarihler</h3>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            Henüz müsaitlik kaydı yok.
          </p>
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
