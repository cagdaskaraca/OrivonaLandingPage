"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AcceptedOfferChecklistDetail } from "@/src/components/event-os/AcceptedOfferChecklistDetail";
import { EventOsBudgetSummary } from "@/src/components/event-os/EventOsBudgetSummary";
import { EventOsChecklistPlanDropdown } from "@/src/components/event-os/EventOsChecklistPlanDropdown";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsProgressBar,
} from "@/src/components/event-os/EventOsShared";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  buildTaskUpdateFromExisting,
  createEventPlanTask,
  deleteEventPlanTask,
  fetchEventPlanTasks,
  generateEventPlanTasks,
  updateEventPlanTask,
} from "@/src/lib/api/eventPlans";
import { getAgreements, getBudgetSummary } from "@/src/lib/api/customerAgreements";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  CustomerAgreement,
  EventPlanBudgetSummary,
  EventTask,
  EventTaskStatus,
} from "@/src/lib/api/types";
import { agreementForTaskCategory } from "@/src/lib/customerAgreementsUi";
import {
  EVENT_TASK_STATUSES,
  normalizeTaskStatus,
} from "@/src/lib/eventOs";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

function checklistProgressPercent(
  tasks: EventTask[],
  agreements: CustomerAgreement[],
): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => {
    if (agreementForTaskCategory(agreements, t)) return true;
    const s = normalizeTaskStatus(t.status);
    return s === "Done" || s === "Skipped";
  }).length;
  return Math.round((done / tasks.length) * 100);
}

function ChecklistPanel({ planId }: { planId: string | number }) {
  const { dataRefreshKey } = useEventOs();
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [agreements, setAgreements] = useState<CustomerAgreement[]>([]);
  const [budget, setBudget] = useState<EventPlanBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const loadBudget = useCallback(async () => {
    setBudgetLoading(true);
    setBudgetError(null);
    try {
      setBudget(await getBudgetSummary(planId));
    } catch (err) {
      logApiError("Budget summary", err);
      setBudget(null);
      setBudgetError(
        formatUiErrorMessage(err, "Bütçe özeti yüklenemedi."),
      );
    } finally {
      setBudgetLoading(false);
    }
  }, [planId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskList, acceptedOffers] = await Promise.all([
        fetchEventPlanTasks(planId),
        getAgreements(planId),
      ]);
      setTasks(taskList);
      setAgreements(acceptedOffers);
    } catch (err) {
      logApiError("Event tasks / accepted offers", err);
      setTasks([]);
      setAgreements([]);
      setError(formatUiErrorMessage(err, "Checklist yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const refreshAll = useCallback(async () => {
    await Promise.all([load(), loadBudget()]);
  }, [load, loadBudget]);

  useEffect(() => {
    void refreshAll();
  }, [planId, dataRefreshKey, refreshAll]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const list = await generateEventPlanTasks(planId);
      setTasks(list);
      await loadBudget();
    } catch (err) {
      logApiError("Generate tasks", err);
      setError(formatUiErrorMessage(err, "Görevler oluşturulamadı."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createEventPlanTask(planId, {
        title: newTitle.trim(),
        status: "Todo",
      });
      setNewTitle("");
      await load();
    } catch (err) {
      logApiError("Create task", err);
      setError(formatUiErrorMessage(err, "Görev eklenemedi."));
    }
  }

  async function setStatus(task: EventTask, status: EventTaskStatus) {
    if (task.id == null) return;
    if (agreementForTaskCategory(agreements, task)) {
      setError(
        "Bu kategori için kabul edilmiş teklif var; durum teklif üzerinden yönetilir.",
      );
      return;
    }
    const title = task.title?.trim();
    if (!title) {
      setError("Görev başlığı eksik; durum güncellenemedi.");
      return;
    }
    setSavingId(task.id);
    setError(null);
    try {
      await updateEventPlanTask(
        planId,
        task.id,
        buildTaskUpdateFromExisting(task, { status }),
      );
      await load();
    } catch (err) {
      logApiError("Update task status", err);
      setError(
        formatUiErrorMessage(
          err,
          "Görev durumu güncellenemedi. Lütfen tekrar deneyin.",
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(task: EventTask) {
    if (task.id == null) return;
    if (agreementForTaskCategory(agreements, task)) {
      setError(
        "Kabul edilmiş teklif bağlı görev silinemez. Önce teklifi «Tekliflerim» bölümünden yönetin.",
      );
      return;
    }
    try {
      await deleteEventPlanTask(planId, task.id);
      await refreshAll();
    } catch (err) {
      logApiError("Delete task", err);
      setError(formatUiErrorMessage(err, "Görev silinemedi."));
    }
  }

  const progress = useMemo(
    () => checklistProgressPercent(tasks, agreements),
    [tasks, agreements],
  );

  const tasksWithOffer = useMemo(
    () =>
      tasks.map((task) => ({
        task,
        acceptedOffer: agreementForTaskCategory(agreements, task),
      })),
    [tasks, agreements],
  );

  return (
    <div className="space-y-4">
      <EventOsChecklistPlanDropdown />
      <EventOsProgressBar percent={progress} />
      <EventOsBudgetSummary
        summary={budget}
        loading={budgetLoading}
        error={budgetError}
        onRetry={() => void loadBudget()}
      />
      <p className="text-xs text-zinc-500">
        Kabul ettiğiniz işletme teklifleri, seçili plan ve kategori ile eşleşen
        checklist maddelerinde otomatik görünür.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          disabled={generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? "Oluşturuluyor…" : "AI Checklist Oluştur"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => void refreshAll()}>
          Yenile
        </button>
      </div>
      {error ? <EventOsError message={error} onRetry={() => void refreshAll()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Checklist yükleniyor…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz görev yok. AI ile oluşturun veya manuel ekleyin.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasksWithOffer.map(({ task, acceptedOffer }) => {
            const current = normalizeTaskStatus(task.status);
            const hasAcceptedOffer = acceptedOffer != null;
            const displayDone = hasAcceptedOffer || current === "Done";

            return (
              <li
                key={String(task.id)}
                className={`rounded-xl border px-4 py-3 ${
                  hasAcceptedOffer
                    ? "border-emerald-400/25 bg-emerald-500/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {displayDone ? (
                        <span
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-xs text-emerald-100 ring-1 ring-emerald-400/40"
                          aria-hidden
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] text-zinc-600"
                          aria-hidden
                        >
                          ○
                        </span>
                      )}
                      <p
                        className={`font-medium ${displayDone ? "text-emerald-50" : "text-white"}`}
                      >
                        {task.title ?? "Görev"}
                      </p>
                    </div>
                    {hasAcceptedOffer ? (
                      <AcceptedOfferChecklistDetail agreement={acceptedOffer} />
                    ) : null}
                    {task.description?.trim() && !hasAcceptedOffer ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        {task.description}
                      </p>
                    ) : null}
                    {task.categoryName?.trim() ? (
                      <span className="mt-2 inline-block rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">
                        {task.categoryName}
                      </span>
                    ) : null}
                  </div>
                  {!hasAcceptedOffer ? (
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-red-300"
                      onClick={() => void handleDelete(task)}
                    >
                      Kaldır
                    </button>
                  ) : null}
                </div>

                {hasAcceptedOffer ? (
                  <p className="mt-2 text-[11px] text-zinc-500">
                    Bu madde, kabul ettiğiniz teklif ile otomatik tamamlandı.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {EVENT_TASK_STATUSES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        disabled={savingId === task.id}
                        onClick={() => void setStatus(task, value)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                          current === value
                            ? value === "Done"
                              ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/35"
                              : value === "Skipped"
                                ? "bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-400/25"
                                : value === "InProgress"
                                  ? "bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/30"
                                  : "bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/35"
                            : "border border-white/10 text-zinc-500 hover:border-violet-400/25 hover:text-zinc-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <input
          className={`${inputClass} min-w-[200px] flex-1`}
          placeholder="Yeni görev…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className={btnSecondary}>
          Ekle
        </button>
      </form>
    </div>
  );
}

export function EventOsChecklistSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <ChecklistPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
