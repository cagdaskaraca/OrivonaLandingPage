"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import { SendInviteModal } from "@/src/components/invites/SendInviteModal";
import {
  createEventPlanGuest,
  deleteEventPlanGuest,
  fetchEventPlanGuests,
  importDemoEventPlanGuests,
  updateEventPlanGuest,
} from "@/src/lib/api/eventPlans";
import {
  sendGuestInvite,
  sendGuestInvitesBulk,
} from "@/src/lib/api/invites";
import { withTimeout } from "@/src/lib/promiseTimeout";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  EventGuest,
  EventGuestFormPayload,
  SendInviteResult,
} from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import {
  RSVP_STATUS_OPTIONS,
  normalizeGuestRsvpForForm,
  rsvpStatusLabel,
} from "@/src/lib/eventOs";
import {
  formatRespondedAt,
  guestDisplayName,
  INVITE_SEND_TIMEOUT_MESSAGE,
  INVITE_SEND_TIMEOUT_MS,
  isInviteSent,
  isTicketSent,
  planDisplayTitle,
} from "@/src/lib/invites";
import {
  btnPrimary,
  btnSecondary,
  dashboardTableWrap,
  inputClass,
  selectClass,
} from "@/src/lib/ui";

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

type InviteModalState =
  | { mode: "single"; guest: EventGuest }
  | { mode: "bulk"; guests: EventGuest[] }
  | null;

function GuestsPanel({ planId }: { planId: string | number }) {
  const { selectedPlan, bumpDataRefresh } = useEventOs();
  const toast = useToast();
  const eventTitle = planDisplayTitle(selectedPlan);

  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventGuestFormPayload>(defaultGuest);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inviteModal, setInviteModal] = useState<InviteModalState>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

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

  useEffect(() => {
    setSelectedIds(new Set());
  }, [planId]);

  const selectableGuests = useMemo(
    () => guests.filter((g) => g.id != null),
    [guests],
  );

  const allSelected =
    selectableGuests.length > 0 &&
    selectableGuests.every((g) => selectedIds.has(String(g.id)));

  function toggleSelect(id: string | number) {
    const key = String(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(
      new Set(selectableGuests.map((g) => String(g.id))),
    );
  }

  const selectedGuests = useMemo(
    () => guests.filter((g) => g.id != null && selectedIds.has(String(g.id))),
    [guests, selectedIds],
  );

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
      bumpDataRefresh();
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
      bumpDataRefresh();
    } catch (err) {
      logApiError("Import demo guests", err);
      setError(formatUiErrorMessage(err, "Demo davetliler yüklenemedi."));
    } finally {
      setImporting(false);
    }
  }

  async function handleSendInvite(message: string): Promise<SendInviteResult> {
    if (!inviteModal) {
      throw new Error("Davetli seçilmedi.");
    }
    const payload = { message, customMessage: message };
    const modalSnapshot = inviteModal;

    let result: SendInviteResult;
    try {
      const sendPromise =
        modalSnapshot.mode === "single"
          ? (() => {
              const id = modalSnapshot.guest.id;
              if (id == null) throw new Error("Davetli kimliği bulunamadı.");
              return sendGuestInvite(planId, id, payload);
            })()
          : (() => {
              const ids = modalSnapshot.guests
                .map((g) => g.id)
                .filter((id): id is string | number => id != null);
              if (ids.length === 0) throw new Error("Davetli seçilmedi.");
              return sendGuestInvitesBulk(planId, { guestIds: ids, ...payload });
            })();

      result = await withTimeout(
        sendPromise,
        INVITE_SEND_TIMEOUT_MS,
        INVITE_SEND_TIMEOUT_MESSAGE,
      );
    } catch (err) {
      logApiError("Send invite", err);
      throw err instanceof Error
        ? err
        : new Error(formatUiErrorMessage(err, "Davetiye gönderilemedi."));
    }

    setSelectedIds(new Set());
    setInviteModal(null);

    if (result.inviteUrl?.trim()) {
      setLastInviteUrl(result.inviteUrl.trim());
      setCopyDone(false);
    }

    void load()
      .then(() => {
        bumpDataRefresh();
      })
      .catch((err) => {
        logApiError("Refresh guests after invite", err);
      });

    return result;
  }

  function handleInviteSuccess(result: SendInviteResult) {
    const msg = result.demoMode
      ? "Demo modda davetiye bağlantısı oluşturuldu."
      : "Davetiye gönderildi.";
    toast.success(msg);
  }

  async function copyInviteLink() {
    if (!lastInviteUrl) return;
    try {
      await navigator.clipboard.writeText(lastInviteUrl);
      setCopyDone(true);
      toast.success("Davet linki panoya kopyalandı.");
    } catch {
      toast.error("Link kopyalanamadı.");
    }
  }

  const modalGuestName =
    inviteModal?.mode === "single"
      ? guestDisplayName(inviteModal.guest)
      : inviteModal?.mode === "bulk"
        ? guestDisplayName(inviteModal.guests[0] ?? {})
        : "";

  const modalGuestCount =
    inviteModal?.mode === "bulk" ? inviteModal.guests.length : 1;

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      {lastInviteUrl ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm">
          <span className="min-w-0 flex-1 truncate text-violet-100/90">
            {lastInviteUrl}
          </span>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => void copyInviteLink()}
          >
            {copyDone ? "Kopyalandı" : "Davet linkini kopyala"}
          </button>
          <button
            type="button"
            className="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => setLastInviteUrl(null)}
          >
            Kapat
          </button>
        </div>
      ) : null}
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
        <button
          type="button"
          className={btnPrimary}
          disabled={selectedGuests.length === 0}
          onClick={() =>
            setInviteModal({ mode: "bulk", guests: selectedGuests })
          }
        >
          Seçili davetlilere davetiye gönder
          {selectedGuests.length > 0 ? ` (${selectedGuests.length})` : ""}
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
        <div className={dashboardTableWrap}>
          <table className="w-full min-w-[38rem] text-left text-sm xl:min-w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs text-zinc-500">
                <th className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="px-3 py-2.5 font-medium">Davetli</th>
                <th className="px-3 py-2.5 font-medium">Davetiye</th>
                <th className="px-3 py-2.5 font-medium">RSVP</th>
                <th className="px-3 py-2.5 font-medium">Bilet</th>
                <th className="px-3 py-2.5 font-medium">Yanıt tarihi</th>
                <th className="px-3 py-2.5 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {guests.map((g) => {
                const id = g.id;
                const responded = formatRespondedAt(
                  g.respondedAt ?? g.rsvpRespondedAt,
                );
                return (
                  <tr key={String(id)} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-3">
                      {id != null ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(String(id))}
                          onChange={() => toggleSelect(id)}
                          aria-label={`${guestDisplayName(g)} seç`}
                        />
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">
                        {guestDisplayName(g)}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {g.email ?? g.phone ?? "—"}
                        {(g.groupName ?? g.group)
                          ? ` · ${g.groupName ?? g.group}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          isInviteSent(g)
                            ? "text-emerald-300/90"
                            : "text-zinc-500"
                        }
                      >
                        {isInviteSent(g) ? "Gönderildi" : "Gönderilmedi"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-violet-100/90">
                      {rsvpStatusLabel(g.rsvpStatus)}
                      {g.plusOneCount ? (
                        <span className="text-zinc-500"> · +{g.plusOneCount}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          isTicketSent(g)
                            ? "text-emerald-300/90"
                            : "text-zinc-500"
                        }
                      >
                        {isTicketSent(g) ? "Gönderildi" : "Gönderilmedi"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">
                      {responded ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {id != null ? (
                          <button
                            type="button"
                            className={`${btnSecondary} px-3 py-1 text-xs`}
                            onClick={() =>
                              setInviteModal({ mode: "single", guest: g })
                            }
                          >
                            Davetiye Gönder
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={`${btnSecondary} px-3 py-1 text-xs`}
                          onClick={() => {
                            setEditingId(id ?? null);
                            setForm(guestToForm(g));
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          className="text-xs text-zinc-600 hover:text-red-300"
                          onClick={async () => {
                            if (id == null) return;
                            try {
                              await deleteEventPlanGuest(planId, id);
                              await load();
                              bumpDataRefresh();
                            } catch (err) {
                              setError(formatUiErrorMessage(err, "Silinemedi."));
                            }
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

      <SendInviteModal
        open={inviteModal != null}
        guestName={modalGuestName}
        eventTitle={eventTitle}
        guestCount={modalGuestCount}
        onClose={() => setInviteModal(null)}
        onSend={handleSendInvite}
        onSuccess={handleInviteSuccess}
      />
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
