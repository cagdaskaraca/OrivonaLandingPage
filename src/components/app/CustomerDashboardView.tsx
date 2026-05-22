"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerOverview } from "@/src/components/app/dashboard/CustomerOverview";
import { DemoShell } from "@/src/components/app/DemoShell";
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
  const { user, logout } = useAuth();
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

  return (
    <DemoShell
      title="Müşteri Paneli"
      subtitle="Profiliniz ve etkinlik talepleriniz."
    >
      <div className="mb-6 flex flex-wrap gap-3">
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
      </div>

      <CustomerOverview />

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Hesabım</h2>
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
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Etkinlik talepleri</h2>
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
      </div>

      <form onSubmit={handleSubmit} className={`${glassCard} space-y-4`}>
        <h2 className="text-lg font-semibold text-white">
          {editingId != null
            ? "Etkinlik talebi düzenle"
            : "Etkinlik talebi oluştur"}
        </h2>
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
    </DemoShell>
  );
}

export function CustomerDashboardView() {
  return (
    <ProtectedRoute allowedRoles={["Customer"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
