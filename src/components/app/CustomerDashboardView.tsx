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
import { EventOsProvider, useEventOs } from "@/src/components/event-os/EventOsContext";
import { EventOsChecklistSection } from "@/src/components/event-os/EventOsChecklistSection";
import { EventOsGuestsSection } from "@/src/components/event-os/EventOsGuestsSection";
import { EventOsPublicInviteSection } from "@/src/components/event-os/EventOsPublicInviteSection";
import { EventOsRemindersSection } from "@/src/components/event-os/EventOsRemindersSection";
import { EventOsRsvpSection } from "@/src/components/event-os/EventOsRsvpSection";
import { EventOsSeatingSection } from "@/src/components/event-os/EventOsSeatingSection";
import { EventPlansSection } from "@/src/components/event-os/EventPlansSection";
import type { DashboardNavGroup, DashboardNavItem } from "@/src/components/dashboard/DashboardSidebar";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  createCustomerEventRequest,
  deleteCustomerEventRequest,
  fetchAccountProfile,
  fetchCustomerEventRequests,
  fetchEventRequestById,
  updateCustomerEventRequest,
} from "@/src/lib/api";
import { attachInvitationDesignToEventRequest } from "@/src/lib/api/invitationDesigns";
import { InvitationDesignPicker } from "@/src/components/invitation-design/InvitationDesignPicker";
import { isInvitationCategory } from "@/src/lib/invitationDesign";
import {
  formatUiErrorMessage,
  isApiNotFound,
  logApiError,
} from "@/src/lib/api/client";
import { CUSTOMER_EMPTY_DATA_MESSAGE } from "@/src/lib/customerDashboard";
import type {
  AccountProfile,
  EventRequest,
  EventRequestFormPayload,
} from "@/src/lib/api/types";
import { useAuth } from "@/src/contexts/AuthContext";
import { DashboardHelpPanel } from "@/src/components/help/DashboardHelpPanel";
import { useDashboardHashScroll } from "@/src/hooks/useDashboardHashScroll";
import { notifyDashboardLayoutReady, scrollToHashWhenReady } from "@/src/lib/scrollToDashboardSection";
import { ActivityFeedSection } from "@/src/components/premium/ActivityFeedSection";
import { EventBoardSection } from "@/src/components/premium/EventBoardSection";
import { MobileHomeSummary } from "@/src/components/premium/MobileHomeSummary";
import { PublicEventPageSection } from "@/src/components/premium/PublicEventPageSection";
import { InvitationDesignSection } from "@/src/components/invitation-design/InvitationDesignSection";
import { EventPlaylistSection } from "@/src/components/playlist/EventPlaylistSection";
import { NumericInput } from "@/src/components/ui/NumericInput";
import {
  btnPrimary,
  btnSecondary,
  glassCard,
  inputClass,
  orivonaDashboardAnchor,
  selectClass,
} from "@/src/lib/ui";

const ENABLE_EVENT_BOARD = false;

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


function DashboardContentInner() {
  const { loadingPlans, bumpDataRefresh, selectedPlanId } = useEventOs();
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
  const [invitationDesignId, setInvitationDesignId] = useState("");

  useDashboardHashScroll({ isLoading: loadingList || loadingPlans });

  useEffect(() => {
    if (!loadingList && !loadingPlans) {
      notifyDashboardLayoutReady();
    }
  }, [loadingList, loadingPlans]);

  useEffect(() => {
    if (ENABLE_EVENT_BOARD) return;
    if (loadingList || loadingPlans) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#event-os-board") return;

    // Prevent access to Event Board section via direct hash navigation.
    scrollToHashWhenReady("#dashboard-help", {
      highlight: true,
      forceSameHash: true,
      updateHash: true,
    });
  }, [loadingList, loadingPlans]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchAccountProfile()
      .then((profile) => {
        if (!cancelled) setAccountProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setAccountProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const customerPhone =
    accountProfile?.phoneNumber?.trim() ||
    accountProfile?.phone?.trim() ||
    user?.phoneNumber?.trim() ||
    "";

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
        const created = await createCustomerEventRequest(form);
        if (invitationDesignId.trim() && created.id != null) {
          try {
            await attachInvitationDesignToEventRequest(
              created.id,
              invitationDesignId,
            );
          } catch (attachErr) {
            logApiError("Attach invitation to event request", attachErr);
          }
        }
        setSuccessMessage("Etkinlik talebi başarıyla oluşturuldu.");
        setForm(defaultForm());
        setInvitationDesignId("");
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

  const navGroups: DashboardNavGroup[] = [
    {
      title: "Başlarken",
      items: [{ id: "dashboard-help", label: "Başlarken" }],
    },
    {
      title: "Etkinlik Yönetimi",
      items: [
        { id: "event-os-plans", label: "Etkinlik Planlarım" },
        ...(ENABLE_EVENT_BOARD
          ? [{ id: "event-os-board", label: "Etkinlik Panosu" } as const]
          : []),
        { id: "event-os-checklist", label: "Checklist" },
        { id: "event-os-reminders", label: "Hatırlatmalar" },
        { id: "event-os-playlist", label: "Müzik Tercihleri" },
      ],
    },
    {
      title: "Davetli Yönetimi",
      items: [
        { id: "event-os-guests", label: "Davetliler" },
        { id: "event-os-rsvp", label: "Katılım Durumu" },
        { id: "event-os-seating", label: "Masa Planı" },
        { id: "event-os-public-invite", label: "Ortak Davet Linki" },
        { id: "event-os-public-page", label: "Herkese Açık Sayfa" },
        { id: "event-os-invitation-design", label: "Davetiye Tasarımı" },
      ],
    },
    {
      title: "Tedarikçi / Teklifler",
      items: [
        { id: "nav-marketplace", label: "Marketplace", href: "/marketplace" },
        { id: "dashboard-events", label: "Etkinlik Talepleri" },
        { id: "dashboard-offers", label: "Tekliflerim" },
        { id: "dashboard-reservations", label: "Rezervasyonlarım" },
        { id: "dashboard-favorites", label: "Favoriler" },
      ],
    },
    {
      title: "İletişim",
      items: [
        { id: "dashboard-messages", label: "Mesajlar" },
        { id: "dashboard-notifications", label: "Bildirimler" },
      ],
    },
    {
      title: "Hesap",
      items: [
        { id: "dashboard-account", label: "Hesabım" },
        { id: "dashboard-activity", label: "Son Aktiviteler" },
        {
          id: "nav-logout",
          label: "Çıkış",
          onClick: () => {
            logout();
            window.location.href = "/login";
          },
        },
      ],
    },
  ];

  const navItems: DashboardNavItem[] = navGroups.flatMap((g) => g.items);

  return (
    <DashboardLayout
      title="Müşteri Paneli"
      subtitle="Profiliniz, Smart Event OS ve etkinlik talepleriniz."
      navItems={navItems}
      navGroups={navGroups}
      fullWidth
      sidebarExpandedWidthClassName="lg:w-[17rem]"
    >
      <MobileHomeSummary />

      <DashboardHelpPanel role="customer" />

      <DashboardSection id="dashboard-account" title="Hesabım">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Profil
          </p>
          <Link href="/account" className={btnSecondary}>
            Profili düzenle
          </Link>
        </div>
        {user ? (
          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Ad
              </dt>
              <dd className="text-white">
                {accountProfile?.fullName ??
                  user.fullName ??
                  user.name ??
                  "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                E-posta
              </dt>
              <dd className="text-white">
                {accountProfile?.email ?? user.email ?? "—"}
              </dd>
            </div>
            {customerPhone ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Telefon
                </dt>
                <dd className="text-white">{customerPhone}</dd>
              </div>
            ) : null}
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

      {ENABLE_EVENT_BOARD ? (
        <DashboardSection id="event-os-board" title="Etkinlik Panosu">
          <EventBoardSection />
        </DashboardSection>
      ) : null}

      <DashboardSection id="event-os-checklist" title="Checklist">
        <EventOsChecklistSection />
      </DashboardSection>

      <DashboardSection id="event-os-playlist" title="Müzik Tercihleri">
        <EventPlaylistSection />
      </DashboardSection>

      <DashboardSection id="event-os-guests" title="Davetliler">
        <EventOsGuestsSection />
      </DashboardSection>

      <DashboardSection id="event-os-rsvp" title="Katılım Durumu">
        <EventOsRsvpSection />
      </DashboardSection>

      <DashboardSection id="event-os-seating" title="Masa Planı">
        <EventOsSeatingSection />
      </DashboardSection>

      <DashboardSection id="event-os-public-invite" title="Ortak Davet Linki">
        <EventOsPublicInviteSection />
      </DashboardSection>

      <DashboardSection id="event-os-public-page" title="Herkese Açık Etkinlik Sayfası">
        <PublicEventPageSection />
      </DashboardSection>

      <DashboardSection id="event-os-invitation-design" title="Davetiye Tasarımı">
        <InvitationDesignSection />
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
            <NumericInput
              value={form.guestCount}
              onChange={(guestCount) =>
                setForm((f) => ({ ...f, guestCount }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe</span>
            <NumericInput
              value={form.budgetMin}
              onChange={(budgetMin) => setForm((f) => ({ ...f, budgetMin }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe</span>
            <NumericInput
              value={form.budgetMax}
              onChange={(budgetMax) => setForm((f) => ({ ...f, budgetMax }))}
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
        {editingId == null &&
        isInvitationCategory(form.eventType) &&
        selectedPlanId != null ? (
          <InvitationDesignPicker
            eventPlanId={selectedPlanId}
            value={invitationDesignId}
            onChange={setInvitationDesignId}
          />
        ) : null}
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

      <section id="dashboard-offers" className={`${orivonaDashboardAnchor} mb-8`}>
        <CustomerOfferRequestsPanel
          onAfterAccept={() => {
            setReservationsKey((k) => k + 1);
            bumpDataRefresh();
          }}
        />
      </section>

      <DashboardSection id="dashboard-reservations" title="Rezervasyonlarım">
        <CustomerReservationsSection key={reservationsKey} />
      </DashboardSection>

      <section id="dashboard-messages" className={`${orivonaDashboardAnchor} mb-8`}>
        <MessagingPanel
          viewerRole="Customer"
          initialConversationId={conversationId}
        />
      </section>

      <DashboardSection id="dashboard-notifications" title="Bildirimler">
        <NotificationsPanel />
      </DashboardSection>

      <DashboardSection id="dashboard-activity" title="Son Aktiviteler">
        <ActivityFeedSection role="customer" />
      </DashboardSection>
    </DashboardLayout>
  );
}

function DashboardContent() {
  return (
    <EventOsProvider>
      <DashboardContentInner />
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
