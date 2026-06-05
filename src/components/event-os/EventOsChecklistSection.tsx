"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";
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
  createChecklistItem,
  deleteEventPlanTask,
  fetchEventPlanTasks,
  generateEventPlanTasks,
  updateEventPlanTask,
} from "@/src/lib/api/eventPlans";
import { useToast } from "@/src/contexts/ToastContext";
import {
  getEventPlanAgreements,
  getEventPlanBoard,
  getEventPlanBudgetSummary,
} from "@/src/lib/api/customerAgreements";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  CustomerAgreement,
  EventPlanBudgetSummary,
  EventTask,
  EventTaskStatus,
} from "@/src/lib/api/types";
import {
  agreementForTaskCategory,
  dedupeActiveAgreementsByCategory,
  dedupeBudgetSummary,
} from "@/src/lib/customerAgreementsUi";
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
  const toast = useToast();
  const { dataRefreshKey } = useEventOs();
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [agreements, setAgreements] = useState<CustomerAgreement[]>([]);
  const [budget, setBudget] = useState<EventPlanBudgetSummary | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [agreementsWarning, setAgreementsWarning] = useState<string | null>(
    null,
  );
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const refreshAll = useCallback(async () => {
    setLoadingTasks(true);
    setLoadingOffers(true);
    setBudgetLoading(true);
    setTasksError(null);
    setAgreementsWarning(null);
    setBudgetError(null);

    const tasksPromise = (async () => {
      try {
        setTasks(await fetchEventPlanTasks(planId));
      } catch (err) {
        logApiError("Event plan tasks", err);
        setTasks([]);
        setTasksError(
          formatUiErrorMessage(err, "Checklist görevleri yüklenemedi."),
        );
      } finally {
        setLoadingTasks(false);
      }
    })();

    const offersPromise = (async () => {
      const result = await getEventPlanAgreements(planId);
      setAgreements(result.items);
      setAgreementsWarning(result.error);
      setLoadingOffers(false);
    })();

    const budgetPromise = (async () => {
      const result = await getEventPlanBudgetSummary(planId);
      setBudget(result.summary);
      setBudgetError(result.error);
      setBudgetLoading(false);
    })();

    void getEventPlanBoard(planId);

    await Promise.all([tasksPromise, offersPromise, budgetPromise]);
  }, [planId]);

  useEffect(() => {
    void refreshAll();
  }, [planId, dataRefreshKey, refreshAll]);

  async function handleGenerate() {
    setGenerating(true);
    setTasksError(null);
    try {
      setTasks(await generateEventPlanTasks(planId));
      const [offers, budgetResult] = await Promise.all([
        getEventPlanAgreements(planId),
        getEventPlanBudgetSummary(planId),
      ]);
      setAgreements(offers.items);
      setAgreementsWarning(offers.error);
      setBudget(budgetResult.summary);
      setBudgetError(budgetResult.error);
    } catch (err) {
      logApiError("Generate tasks", err);
      setTasksError(formatUiErrorMessage(err, "Görevler oluşturulamadı."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      toast.error("Madde başlığı boş olamaz.");
      return;
    }
    setAdding(true);
    setTasksError(null);
    try {
      const created = await createChecklistItem(planId, {
        title,
        category: null,
        note: null,
        dueDate: null,
      });
      setNewTitle("");
      if (created.id != null) {
        setTasks((prev) => {
          const exists = prev.some((t) => String(t.id) === String(created.id));
          return exists ? prev : [...prev, created];
        });
      } else {
        const list = await fetchEventPlanTasks(planId);
        setTasks(list);
      }
      toast.success("Checklist maddesi eklendi.");
    } catch (err) {
      logApiError("Create checklist item", err);
      const message = formatUiErrorMessage(err, "Madde eklenemedi.");
      setTasksError(message);
      toast.error(message);
    } finally {
      setAdding(false);
    }
  }

  async function setStatus(task: EventTask, status: EventTaskStatus) {
    if (task.id == null) return;
    if (agreementForTaskCategory(activeAgreements, task)) {
      setTasksError(
        "Bu kategori için kabul edilmiş teklif var; durum teklif üzerinden yönetilir.",
      );
      return;
    }
    const title = task.title?.trim();
    if (!title) {
      setTasksError("Görev başlığı eksik; durum güncellenemedi.");
      return;
    }
    setSavingId(task.id);
    setTasksError(null);
    try {
      await updateEventPlanTask(
        planId,
        task.id,
        buildTaskUpdateFromExisting(task, { status }),
      );
      setTasks(await fetchEventPlanTasks(planId));
    } catch (err) {
      logApiError("Update task status", err);
      setTasksError(
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
    if (agreementForTaskCategory(activeAgreements, task)) {
      setTasksError(
        "Kabul edilmiş teklif bağlı görev silinemez. Teklifi «Tekliflerim» bölümünden yönetin.",
      );
      return;
    }
    try {
      await deleteEventPlanTask(planId, task.id);
      await refreshAll();
    } catch (err) {
      logApiError("Delete task", err);
      setTasksError(formatUiErrorMessage(err, "Görev silinemedi."));
    }
  }

  const activeAgreements = useMemo(
    () => dedupeActiveAgreementsByCategory(agreements),
    [agreements],
  );

  const displayBudget = useMemo(
    () => (budget ? dedupeBudgetSummary(budget) : null),
    [budget],
  );

  const progress = useMemo(
    () => checklistProgressPercent(tasks, activeAgreements),
    [tasks, activeAgreements],
  );

  const tasksWithOffer = useMemo(
    () =>
      tasks.map((task) => ({
        task,
        acceptedOffer: agreementForTaskCategory(activeAgreements, task),
      })),
    [tasks, activeAgreements],
  );

  const listLoading = loadingTasks || loadingOffers;

  return (
    <div className="space-y-4">
      <EventOsChecklistPlanDropdown />
      <EventOsProgressBar percent={progress} />
      <EventOsBudgetSummary
        summary={displayBudget}
        loading={budgetLoading}
        error={budgetError}
        onRetry={() => void refreshAll()}
      />
      {agreementsWarning ? (
        <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {agreementsWarning}
        </p>
      ) : null}
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
      {tasksError ? (
        <EventOsError message={tasksError} onRetry={() => void refreshAll()} />
      ) : null}
      {listLoading ? (
        <p className="text-sm text-zinc-500">Checklist yükleniyor…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz görev yok. AI ile oluşturun veya manuel ekleyin.
        </p>
      ) : (
        <DashboardPaginatedList
          items={tasksWithOffer}
          listClassName="space-y-3"
          searchPlaceholder="Görev ara…"
          filterItem={({ task }, query) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const hay = [task.title, task.categoryName, task.description, task.status]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          }}
          getItemKey={({ task }) => String(task.id)}
          renderItem={({ task, acceptedOffer }) => {
            const current = normalizeTaskStatus(task.status);
            const hasAcceptedOffer = acceptedOffer != null;
            const displayDone = hasAcceptedOffer || current === "Done";

            return (
              <div
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
                        {task.title ?? task.categoryName ?? "Görev"}
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
              </div>
            );
          }}
        />
      )}
      <form
        onSubmit={(e) => void handleAdd(e)}
        className="flex flex-wrap gap-2 border-t border-white/10 pt-4"
      >
        <label className="sr-only" htmlFor="checklist-new-title">
          Yeni checklist maddesi
        </label>
        <input
          id="checklist-new-title"
          className={`${inputClass} min-w-[200px] flex-1`}
          placeholder="Yeni madde…"
          value={newTitle}
          disabled={adding}
          required
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          type="submit"
          className={btnPrimary}
          disabled={adding || !newTitle.trim()}
        >
          {adding ? "Ekleniyor…" : "Ekle"}
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
