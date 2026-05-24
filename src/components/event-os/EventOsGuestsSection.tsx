"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
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
import { fetchEventPlanPublicInvite } from "@/src/lib/api/publicEventInvite";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventGuest, EventGuestFormPayload } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import {
  RSVP_STATUS_OPTIONS,
  normalizeGuestRsvpForForm,
  rsvpStatusLabel,
} from "@/src/lib/eventOs";
import {
  formatRespondedAt,
  guestDisplayName,
  isTicketSent,
  planDisplayTitle,
  resolvePublicInviteUrl,
  shareInviteViaWhatsApp,
} from "@/src/lib/invites";
import { EmailField } from "@/src/components/ui/EmailField";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { PhoneField } from "@/src/components/ui/PhoneField";
import { isValidEmail, isValidStoredPhone } from "@/src/lib/contactValidation";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
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
  const [sharing, setSharing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);

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

  async function handleShareLink() {
    setSharing(true);
    try {
      const invite = await fetchEventPlanPublicInvite(planId);
      const url = resolvePublicInviteUrl(invite);
      if (!url) {
        toast.error("Önce «Ortak Davet Linki» bölümünden link oluşturun.");
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Ortak davet linki kopyalandı.");
    } catch (err) {
      logApiError("Share public invite", err);
      toast.error(
        formatUiErrorMessage(err, "Link paylaşılamadı. Ortak Davet Linki bölümünü kontrol edin."),
      );
    } finally {
      setSharing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    const emailFilled = Boolean(form.email?.trim());
    const phoneFilled = Boolean(form.phone?.trim());
    if (emailFilled && !isValidEmail(form.email!)) return;
    if (phoneFilled && !isValidStoredPhone(form.phone, false)) return;
    if (!emailValid || !phoneValid) return;

    setSaving(true);
    try {
      const payload: EventGuestFormPayload = {
        ...form,
        email: form.email?.trim() ?? "",
        phone: form.phone?.trim() ?? "",
      };
      if (editingId != null) {
        await updateEventPlanGuest(planId, editingId, payload);
      } else {
        await createEventPlanGuest(planId, payload);
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

  async function handleWhatsAppShare() {
    setSharing(true);
    try {
      const invite = await fetchEventPlanPublicInvite(planId);
      let url = resolvePublicInviteUrl(invite);
      if (!url) {
        toast.error("Önce ortak davet linki oluşturun.");
        return;
      }
      shareInviteViaWhatsApp(url, eventTitle);
    } catch (err) {
      toast.error(formatUiErrorMessage(err, "Paylaşılamadı."));
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <p className="text-sm text-zinc-500">
        Misafirler ortak davet linkinden kendilerini doğrular. E-posta gönderimi
        gerekmez — linki WhatsApp veya mesajla paylaşın.
      </p>
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
          disabled={sharing}
          onClick={() => void handleShareLink()}
        >
          {sharing ? "…" : "Linki paylaş"}
        </button>
        <button
          type="button"
          className={btnSecondary}
          disabled={sharing}
          onClick={() => void handleWhatsAppShare()}
        >
          WhatsApp
        </button>
      </div>
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Davetliler yükleniyor…</p>
      ) : guests.length === 0 ? (
        <EmptyState
          icon={EMPTY_STATE_PRESETS.guests.icon}
          title={EMPTY_STATE_PRESETS.guests.title}
          description={EMPTY_STATE_PRESETS.guests.description}
          actionLabel={EMPTY_STATE_PRESETS.guests.actionLabel}
          onAction={() => {
            document
              .getElementById(EMPTY_STATE_PRESETS.guests.sectionId ?? "")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      ) : (
        <div className={dashboardTableWrap}>
          <table className="w-full min-w-[34rem] text-left text-sm xl:min-w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs text-zinc-500">
                <th className="px-3 py-2.5 font-medium">Ad Soyad</th>
                <th className="px-3 py-2.5 font-medium">İletişim</th>
                <th className="px-3 py-2.5 font-medium">Katılım Durumu</th>
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
                const contact = [g.phone, g.email].filter(Boolean).join(" · ");
                return (
                  <tr key={String(id)} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-medium text-white">
                      {guestDisplayName(g)}
                      {(g.groupName ?? g.group) ? (
                        <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                          {g.groupName ?? g.group}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-400">
                      {contact || "—"}
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
                        {isTicketSent(g) ? "Oluşturuldu" : "Bekliyor"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">
                      {responded ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className={`${btnSecondary} px-3 py-1 text-xs`}
                          disabled={sharing}
                          onClick={() => void handleShareLink()}
                        >
                          Linki paylaş
                        </button>
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
          <span className="mb-1 block text-xs text-zinc-400">Ad Soyad</span>
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
          <EmailField
            value={form.email ?? ""}
            onChange={(email) => setForm((f) => ({ ...f, email }))}
            showValidation={showValidation}
            onValidityChange={setEmailValid}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Telefon</span>
          <PhoneField
            value={form.phone ?? ""}
            onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            showValidation={showValidation}
            onValidityChange={setPhoneValid}
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
          <span className="mb-1 block text-xs text-zinc-400">Katılım Durumu</span>
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
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">+1 sayısı</span>
          <NumericInput
            min={0}
            value={form.plusOneCount ?? 0}
            onChange={(plusOneCount) =>
              setForm((f) => ({ ...f, plusOneCount }))
            }
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            className={btnPrimary}
            disabled={
              saving ||
              !form.fullName.trim() ||
              !emailValid ||
              !phoneValid
            }
          >
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
