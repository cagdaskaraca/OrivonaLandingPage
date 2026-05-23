"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessagingPanel } from "@/src/components/messaging/MessagingPanel";
import { CustomerFavoritesSection } from "@/src/components/app/dashboard/CustomerFavoritesSection";
import { CustomerReservationsSection } from "@/src/components/app/dashboard/CustomerReservationsSection";
import { CustomerSummarySection } from "@/src/components/app/dashboard/CustomerSummarySection";
import { CustomerOfferRequestsPanel } from "@/src/components/offers/CustomerOfferRequestsPanel";
import { DashboardLayout } from "@/src/components/dashboard/DashboardLayout";
import { DashboardSection } from "@/src/components/dashboard/DashboardSection";
import { NotificationsPanel } from "@/src/components/dashboard/NotificationsPanel";
import { EventOsProvider } from "@/src/components/event-os/EventOsContext";
import { EventOsChecklistSection } from "@/src/components/event-os/EventOsChecklistSection";
import { EventOsGuestsSection } from "@/src/components/event-os/EventOsGuestsSection";
import { EventOsQrSection } from "@/src/components/event-os/EventOsQrSection";
import { EventOsRemindersSection } from "@/src/components/event-os/EventOsRemindersSection";
import { EventOsRsvpSection } from "@/src/components/event-os/EventOsRsvpSection";
import { EventOsSeatingSection } from "@/src/components/event-os/EventOsSeatingSection";
import { EventPlansSection } from "@/src/components/event-os/EventPlansSection";
import type { DashboardNavItem } from "@/src/components/dashboard/DashboardSidebar";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  createCustomerEventRequest,
  deleteCustomerEventRequest,
  fetchCustomerEventRequests,
  fetchEventRequestById,
  updateCustomerEventRequest,
} from "@/src/lib/api";
import {
  formatUiErrorMessage,
  isApiNotFound,
  logApiError,
} from "@/src/lib/api/client";
import { CUSTOMER_EMPTY_DATA_MESSAGE } from "@/src/lib/customerDashboard";
import type { EventRequest, EventRequestFormPayload } from "@/src/lib/api/types";
import { useAuth } from "@/src/contexts/AuthContext";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

const EVENT_REQUEST_STATUS_OPTIONS = [
  { value: "", label: "Değiştirme" },
  { value: "Draft", label: "Taslak" },
  { value: "Submitted", label: "Gönderildi" },
  { value: "InReview", label: "İncelemede" },
  { value: "Completed", label: "Tamamlandı" },
  { value: "Cancelled", label: "İptal Edildi" },
] as const;

function resolveEventRequestTitle(request: EventRequest): string {
  const title = request.title?.trim();
  if (title) return title;
  return "";
}

function displayEventRequestTitle(request: EventRequest): string {
  const title = resolveEventRequestTitle(request);
  if (title) return title;
  return request.eventType?.trim() || "Talep";
}

function defaultForm(): EventRequestFormPayload {
  return {
    title: "",
    eventType: "Düğün",
    eventDate: "",
    city: "İstanbul",
    district: "",
    guestCount: 100,
    budgetMin: 100000,
    budgetMax: 300000,
    notes: "",
    status: "",
  };
}

function formatEventDateForInput(value?: string): string {
  if (!value) return "";
  const slice = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : "";
}

function eventRequestToForm(request: EventRequest): EventRequestFormPayload {
  return {
    title: resolveEventRequestTitle(request),
    eventType: request.eventType ?? "",
    eventDate: formatEventDateForInput(request.eventDate),
    city: request.city ?? "",
    district: request.district ?? "",
    guestCount: request.guestCount ?? 0,
    budgetMin: request.budgetMin ?? 0,
    budgetMax: request.budgetMax ?? 0,
    notes: request.notes ?? request.description ?? "",
    status: request.status ?? "",
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const { user, logout } = useAuth();
  const [reservationsKey, setReservationsKey] = useState(0);
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<EventRequestFormPayload>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function load() {
    setLoadingList(true);
    setErrorMessage(null);
    try {
      const list = await fetchCustomerEventRequests();
      setRequests(list);
    } catch (err) {
      logApiError("Event requests list", err);
      setRequests([]);
      if (!isApiNotFound(err)) {
        setErrorMessage(
          formatUiErrorMessage(err, "Etkinlik talepleri yüklenemedi."),
        );
      }
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultForm());
    setErrorMessage(null);
  }

  async function startEdit(request: EventRequest) {
    if (request.id == null) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditingId(request.id);
    setForm(eventRequestToForm(request));
    try {
      const detail = await fetchEventRequestById(request.id);
      setForm(eventRequestToForm({ ...request, ...detail }));
    } catch (err) {
      logApiError("Event request fetch", err);
      if (!isApiNotFound(err)) {
        setErrorMessage(formatUiErrorMessage(err, "Talep yüklenemedi."));
      }
    }
  }

  async function handleDelete(request: EventRequest) {
    if (request.id == null) return;
    const label = displayEventRequestTitle(request);
    if (
      !window.confirm(
        `"${label}" etkinlik talebini silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }
    setDeletingId(request.id);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await deleteCustomerEventRequest(request.id);
      if (editingId === request.id) cancelEdit();
      setSuccessMessage("Etkinlik talebi silindi.");
      await load();
    } catch (err) {
      logApiError("Event request delete", err);
      if (!isApiNotFound(err)) {
        setErrorMessage(formatUiErrorMessage(err, "Talep silinemedi."));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      if (editingId != null) {
        await updateCustomerEventRequest(editingId, form);
        setSuccessMessage("Etkinlik talebi güncellendi.");
        cancelEdit();
      } else {
        await createCustomerEventRequest(form);
        setSuccessMessage("Etkinlik talebi başarıyla oluşturuldu.");
        setForm(defaultForm());
      }
      await load();
    } catch (err) {
      logApiError(
        editingId != null ? "Event request update" : "Event request create",
        err,
      );
      if (!isApiNotFound(err)) {
        setErrorMessage(
          formatUiErrorMessage(
            err,
            editingId != null
              ? "Etkinlik talebi güncellenemedi."
              : "Etkinlik talebi oluşturulamadı. Lütfen tekrar deneyin.",
          ),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  const navItems: DashboardNavItem[] = [
    { id: "dashboard-account", label: "Hesabım" },
    { id: "event-os-plans", label: "Etkinlik Planlarım" },
    { id: "event-os-checklist", label: "Checklist" },
    { id: "event-os-guests", label: "Davetliler" },
    { id: "event-os-rsvp", label: "RSVP" },
    { id: "event-os-seating", label: "Masa Planı" },
    { id: "event-os-qr", label: "QR Davetiye" },
    { id: "event-os-reminders", label: "Hatırlatmalar" },
    { id: "dashboard-events", label: "Etkinlik Talepleri" },
    { id: "dashboard-favorites", label: "Favoriler" },
    { id: "dashboard-offers", label: "Tekliflerim" },
    { id: "dashboard-reservations", label: "Rezervasyonlarım" },
    { id: "dashboard-messages", label: "Mesajlar" },
    { id: "dashboard-notifications", label: "Bildirimler" },
  ];

  const toolbar = (
    <>
      <button
        type="button"
        className={btnSecondary}
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
      >
        Çıkış
      </button>
      <Link href="/account" className={btnSecondary}>
        Profil düzenle
      </Link>
      <Link href="/marketplace" className={btnSecondary}>
        Marketplace
      </Link>
    </>
  );

  return (
    <EventOsProvider>
    <DashboardLayout
      title="Müşteri Paneli"
      subtitle="Profiliniz, Smart Event OS ve etkinlik talepleriniz."
      navItems={navItems}
      toolbar={toolbar}
    >
      <DashboardSection id="dashboard-account" title="Hesabım">
        {user ? (
          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                E-posta
              </dt>
              <dd className="text-white">{user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Ad
              </dt>
              <dd className="text-white">
                {user.fullName ?? user.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Rol
              </dt>
              <dd className="text-white">{user.role ?? "Customer"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">Yükleniyor…</p>
        )}
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-violet-200/90">Özet</h3>
          <CustomerSummarySection />
        </div>
      </DashboardSection>

      <DashboardSection id="event-os-plans" title="Etkinlik Planlarım">
        <EventPlansSection />
      </DashboardSection>

      <DashboardSection id="event-os-checklist" title="Checklist">
        <EventOsChecklistSection />
      </DashboardSection>

      <DashboardSection id="event-os-guests" title="Davetliler">
        <EventOsGuestsSection />
      </DashboardSection>

      <DashboardSection id="event-os-rsvp" title="RSVP">
        <EventOsRsvpSection />
      </DashboardSection>

      <DashboardSection id="event-os-seating" title="Masa Planı">
        <EventOsSeatingSection />
      </DashboardSection>

      <DashboardSection id="event-os-qr" title="QR Davetiye">
        <EventOsQrSection />
      </DashboardSection>

      <DashboardSection id="event-os-reminders" title="Hatırlatmalar">
        <EventOsRemindersSection />
      </DashboardSection>

      <DashboardSection id="dashboard-events" title="Etkinlik talepleri">
        {loadingList ? (
          <p className="mt-3 text-sm text-zinc-500">Talepler yükleniyor…</p>
        ) : null}
        {!loadingList && requests.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {requests.map((r) => (
              <li
                key={String(r.id)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <p className="font-medium text-white">
                  {displayEventRequestTitle(r)}
                </p>
                <p className="mt-1 text-zinc-400">
                  {[r.city, r.district].filter(Boolean).join(" · ")} ·{" "}
                  {r.guestCount ?? "—"} kişi
                  {r.eventDate
                    ? ` · ${formatEventDateForInput(r.eventDate)}`
                    : ""}
                </p>
                {r.status ? (
                  <p className="mt-1 text-xs text-violet-300">{r.status}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} px-4 py-1.5 text-xs`}
                    onClick={() => startEdit(r)}
                    disabled={r.id == null || deletingId === r.id}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} px-4 py-1.5 text-xs`}
                    onClick={() => handleDelete(r)}
                    disabled={r.id == null || deletingId === r.id}
                  >
                    {deletingId === r.id ? "Siliniyor…" : "Sil"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loadingList && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              {CUSTOMER_EMPTY_DATA_MESSAGE} Aşağıdaki formdan yeni bir talep
              oluşturabilirsiniz.
            </p>
          )
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t border-white/10 pt-8">
        <h3 className="text-base font-semibold text-white">
          {editingId != null
            ? "Etkinlik talebi düzenle"
            : "Etkinlik talebi oluştur"}
        </h3>
        {(
          [
            ["title", "Başlık"],
            ["eventType", "Etkinlik türü"],
            ["city", "Şehir"],
            ["district", "İlçe"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">{label}</span>
            <input
              className={inputClass}
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              required={key === "title" || key === "eventType" || key === "city"}
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Etkinlik tarihi
          </span>
          <input
            type="date"
            className={inputClass}
            value={form.eventDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, eventDate: e.target.value }))
            }
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Misafir</span>
            <input
              type="number"
              className={inputClass}
              value={form.guestCount}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  guestCount: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe</span>
            <input
              type="number"
              className={inputClass}
              value={form.budgetMin}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  budgetMin: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe</span>
            <input
              type="number"
              className={inputClass}
              value={form.budgetMax}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  budgetMax: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>
        {editingId != null ? (
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Durum</span>
            <select
              className={selectClass}
              value={form.status ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              {EVENT_REQUEST_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value || "unchanged"} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Notlar</span>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
        {successMessage ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving
              ? "Gönderiliyor…"
              : editingId != null
                ? "Değişiklikleri Kaydet"
                : "Talep Oluştur"}
          </button>
          {editingId != null ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={cancelEdit}
              disabled={saving}
            >
              İptal
            </button>
          ) : null}
        </div>
      </form>
      </DashboardSection>

      <DashboardSection id="dashboard-favorites" title="Favoriler">
        <CustomerFavoritesSection />
      </DashboardSection>

      <section id="dashboard-offers" className="scroll-mt-24 mb-8">
        <CustomerOfferRequestsPanel
          onAfterAccept={() => setReservationsKey((k) => k + 1)}
        />
      </section>

      <DashboardSection id="dashboard-reservations" title="Rezervasyonlarım">
        <CustomerReservationsSection key={reservationsKey} />
      </DashboardSection>

      <section id="dashboard-messages" className="scroll-mt-24 mb-8">
        <MessagingPanel
          viewerRole="Customer"
          initialConversationId={conversationId}
        />
      </section>

      <DashboardSection id="dashboard-notifications" title="Bildirimler">
        <NotificationsPanel />
      </DashboardSection>
    </DashboardLayout>
    </EventOsProvider>
  );
}

export function CustomerDashboardView() {
  return (
    <ProtectedRoute allowedRoles={["Customer"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
