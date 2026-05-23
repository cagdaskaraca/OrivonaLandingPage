"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  createEventPlanGuest,
  deleteEventPlanGuest,
  fetchEventPlanGuests,
  importDemoEventPlanGuests,
  updateEventPlanGuest,
} from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventGuest, EventGuestFormPayload } from "@/src/lib/api/types";
import {
  RSVP_STATUS_OPTIONS,
  normalizeGuestRsvpForForm,
  rsvpStatusLabel,
} from "@/src/lib/eventOs";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

function defaultGuest(): EventGuestFormPayload {
  return {
    fullName: "",
    email: "",
    phone: "",
    groupName: "",
    note: "",
    rsvpStatus: "Pending",
    plusOneCount: 0,
  };
}

function guestToForm(g: EventGuest): EventGuestFormPayload {
  return {
    fullName: g.fullName ?? g.name ?? "",
    email: g.email ?? "",
    phone: g.phone ?? "",
    groupName: g.groupName ?? g.group ?? "",
    note: g.note ?? g.notes ?? "",
    rsvpStatus: normalizeGuestRsvpForForm(g.rsvpStatus),
    plusOneCount: g.plusOneCount ?? 0,
  };
}

function GuestsPanel({ planId }: { planId: string | number }) {
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventGuestFormPayload>(defaultGuest);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGuests(await fetchEventPlanGuests(planId));
    } catch (err) {
      logApiError("Event guests", err);
      setGuests([]);
      setError(formatUiErrorMessage(err, "Davetliler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId != null) {
        await updateEventPlanGuest(planId, editingId, form);
      } else {
        await createEventPlanGuest(planId, form);
      }
      setForm(defaultGuest());
      setEditingId(null);
      await load();
    } catch (err) {
      logApiError("Save guest", err);
      setError(formatUiErrorMessage(err, "Davetli kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleImportDemo() {
    setImporting(true);
    try {
      await importDemoEventPlanGuests(planId);
      await load();
    } catch (err) {
      logApiError("Import demo guests", err);
      setError(formatUiErrorMessage(err, "Demo davetliler yüklenemedi."));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnSecondary}
          disabled={importing}
          onClick={() => void handleImportDemo()}
        >
          {importing ? "…" : "Demo davetliler"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => void load()}>
          Yenile
        </button>
      </div>
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Davetliler yükleniyor…</p>
      ) : guests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz davetli yok.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
          {guests.map((g) => (
            <li
              key={String(g.id)}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">
                  {g.fullName ?? g.name ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {(g.groupName ?? g.group)
                    ? `${g.groupName ?? g.group} · `
                    : ""}
                  {rsvpStatusLabel(g.rsvpStatus)}
                  {g.plusOneCount ? ` · +${g.plusOneCount}` : ""}
                  {g.tableName ? ` · ${g.tableName}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${btnSecondary} px-3 py-1 text-xs`}
                  onClick={() => {
                    setEditingId(g.id ?? null);
                    setForm(guestToForm(g));
                  }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="text-xs text-zinc-600 hover:text-red-300"
                  onClick={async () => {
                    if (g.id == null) return;
                    try {
                      await deleteEventPlanGuest(planId, g.id);
                      await load();
                    } catch (err) {
                      setError(formatUiErrorMessage(err, "Silinemedi."));
                    }
                  }}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2"
      >
        <h3 className="text-sm font-semibold text-violet-200/90 sm:col-span-2">
          {editingId != null ? "Davetli düzenle" : "Davetli ekle"}
        </h3>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-xs text-zinc-400">Ad</span>
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullName: e.target.value }))
            }
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">E-posta</span>
          <input
            className={inputClass}
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Telefon</span>
          <input
            className={inputClass}
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Grup</span>
          <input
            className={inputClass}
            value={form.groupName ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, groupName: e.target.value }))
            }
            placeholder="Aile, İş…"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">RSVP</span>
          <select
            className={selectClass}
            value={form.rsvpStatus ?? "Pending"}
            onChange={(e) =>
              setForm((f) => ({ ...f, rsvpStatus: e.target.value }))
            }
          >
            {RSVP_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-xs text-zinc-400">Not</span>
          <input
            className={inputClass}
            value={form.note ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Örn. Vejetaryen menü…"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">+1 sayısı</span>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.plusOneCount ?? 0}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                plusOneCount: Number(e.target.value),
              }))
            }
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "…" : editingId != null ? "Güncelle" : "Ekle"}
          </button>
          {editingId != null ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setEditingId(null);
                setForm(defaultGuest());
              }}
            >
              İptal
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export function EventOsGuestsSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <GuestsPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
