"use client";

import { useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  EventOsError,
  EventOsProgressBar,
} from "@/src/components/event-os/EventOsShared";
import {
  createEventPlan,
  deleteEventPlan,
  fetchEventPlanTasks,
  updateEventPlan,
} from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventPlan, EventPlanFormPayload } from "@/src/lib/api/types";
import {
  defaultEventPlanForm,
  planDisplayTitle,
  taskProgressPercent,
} from "@/src/lib/eventOs";
import { DashboardHorizontalRail } from "@/src/components/dashboard/DashboardHorizontalRail";
import { EventPlanCountdown } from "@/src/components/premium/EventPlanCountdown";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { useToast } from "@/src/contexts/ToastContext";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

function planToForm(plan: EventPlan): EventPlanFormPayload {
  return {
    title: plan.title ?? "",
    eventType: plan.eventType ?? "Düğün",
    eventDate: plan.eventDate?.slice(0, 10) ?? "",
    city: plan.city ?? "",
    district: plan.district ?? "",
    guestCount: plan.guestCount ?? 0,
    budgetMin: plan.budgetMin ?? 0,
    budgetMax: plan.budgetMax ?? 0,
    notes: plan.notes ?? "",
  };
}

export function EventPlansSection() {
  const toast = useToast();
  const { plans, loadingPlans, plansError, refreshPlans, selectPlan } =
    useEventOs();
  const [form, setForm] = useState<EventPlanFormPayload>(defaultEventPlanForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressByPlan, setProgressByPlan] = useState<Record<string, number>>(
    {},
  );

  async function loadProgressForPlans(list: EventPlan[]) {
    const entries = await Promise.all(
      list.map(async (p) => {
        if (p.id == null) return null;
        try {
          const tasks = await fetchEventPlanTasks(p.id);
          return [String(p.id), taskProgressPercent(tasks, p)] as const;
        } catch {
          return [
            String(p.id),
            p.progressPercent ?? 0,
          ] as const;
        }
      }),
    );
    const next: Record<string, number> = {};
    for (const e of entries) {
      if (e) next[e[0]] = e[1];
    }
    setProgressByPlan(next);
  }

  useEffect(() => {
    if (plans.length > 0) void loadProgressForPlans(plans);
  }, [plans]);

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultEventPlanForm());
  }

  function startEdit(plan: EventPlan) {
    if (plan.id == null) return;
    setEditingId(plan.id);
    setForm(planToForm(plan));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId != null) {
        await updateEventPlan(editingId, form);
        toast.success("Plan güncellendi.");
        setSuccess("Plan güncellendi.");
        cancelEdit();
      } else {
        const created = await createEventPlan(form);
        toast.success("Etkinlik planı oluşturuldu.");
        setSuccess("Etkinlik planı oluşturuldu.");
        setForm(defaultEventPlanForm());
        if (created.id != null) selectPlan(created.id);
      }
      await refreshPlans({ silent: true });
    } catch (err) {
      logApiError("Event plan save", err);
      setError(formatUiErrorMessage(err, "Plan kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(plan: EventPlan) {
    if (plan.id == null) return;
    if (
      !window.confirm(
        `"${planDisplayTitle(plan)}" planını silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }
    setDeletingId(plan.id);
    try {
      await deleteEventPlan(plan.id);
      toast.success("Plan silindi.");
      setSuccess("Plan silindi.");
      if (editingId === plan.id) cancelEdit();
      await refreshPlans({ silent: true });
    } catch (err) {
      logApiError("Event plan delete", err);
      setError(formatUiErrorMessage(err, "Plan silinemedi."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Smart Event OS — etkinliğinizi planlayın, checklist, davetli ve masa
        planını tek yerden yönetin.
      </p>

      {plansError ? (
        <EventOsError message={plansError} onRetry={() => void refreshPlans()} />
      ) : null}

      {loadingPlans ? (
        <p className="text-sm text-zinc-500">Planlar yükleniyor…</p>
      ) : plans.length > 0 ? (
        <DashboardHorizontalRail
          items={plans}
          getItemKey={(p) => String(p.id)}
          hintThreshold={3}
          renderItem={(p) => (
            <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => p.id != null && selectPlan(p.id)}
                >
                  <p className="font-medium text-white">{planDisplayTitle(p)}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[p.city, p.district].filter(Boolean).join(" · ")}
                    {p.eventDate ? ` · ${p.eventDate.slice(0, 10)}` : ""}
                    {p.guestCount != null ? ` · ${p.guestCount} kişi` : ""}
                  </p>
                  <EventPlanCountdown eventDate={p.eventDate} className="mt-1.5" />
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} px-3 py-1 text-xs`}
                    onClick={() => startEdit(p)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} px-3 py-1 text-xs text-red-200`}
                    disabled={deletingId === p.id}
                    onClick={() => void handleDelete(p)}
                  >
                    {deletingId === p.id ? "…" : "Sil"}
                  </button>
                </div>
              </div>
              {p.id != null && progressByPlan[String(p.id)] != null ? (
                <div className="mt-3">
                  <EventOsProgressBar percent={progressByPlan[String(p.id)]!} />
                </div>
              ) : null}
            </div>
          )}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz etkinlik planınız yok. Aşağıdan oluşturun.
        </p>
      )}

      <form
        id="event-os-plans-new"
        onSubmit={handleSubmit}
        className="space-y-4 border-t border-white/10 pt-6 scroll-mt-28"
      >
        <h3 className="text-sm font-semibold text-violet-200/90">
          {editingId != null ? "Planı düzenle" : "Yeni etkinlik planı"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Başlık</span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik türü</span>
            <input
              className={inputClass}
              value={form.eventType}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventType: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Tarih</span>
            <input
              type="date"
              className={`${inputClass} [color-scheme:dark]`}
              value={form.eventDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventDate: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
            <input
              className={inputClass}
              value={form.district}
              onChange={(e) =>
                setForm((f) => ({ ...f, district: e.target.value }))
              }
            />
          </label>
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
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Notlar</span>
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
        {success ? (
          <p className="text-sm text-emerald-300/90">{success}</p>
        ) : null}
        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving
              ? "Kaydediliyor…"
              : editingId != null
                ? "Güncelle"
                : "Plan Oluştur"}
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
    </div>
  );
}
