"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
  EventOsProgressBar,
} from "@/src/components/event-os/EventOsShared";
import { CustomerAgreementModal } from "@/src/components/event-os/CustomerAgreementModal";
import { EventOsBudgetSummary } from "@/src/components/event-os/EventOsBudgetSummary";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { useToast } from "@/src/contexts/ToastContext";
import {
  buildTaskUpdateFromExisting,
  createEventPlanTask,
  deleteEventPlanTask,
  fetchEventPlanTasks,
  generateEventPlanTasks,
  updateEventPlanTask,
} from "@/src/lib/api/eventPlans";
import {
  deleteAgreement,
  getAgreements,
  getBudgetSummary,
} from "@/src/lib/api/customerAgreements";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  CustomerAgreement,
  EventPlanBudgetSummary,
  EventTask,
  EventTaskStatus,
} from "@/src/lib/api/types";
import {
  agreementForTask,
  formatAgreementSummary,
} from "@/src/lib/customerAgreementsUi";
import {
  EVENT_TASK_STATUSES,
  normalizeTaskStatus,
  taskProgressPercent,
} from "@/src/lib/eventOs";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

function ChecklistPanel({ planId }: { planId: string | number }) {
  const { selectedPlan } = useEventOs();
  const toast = useToast();
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
  const [removingAgreementId, setRemovingAgreementId] = useState<
    string | number | null
  >(null);
  const [modalTask, setModalTask] = useState<EventTask | null>(null);
  const [modalAgreement, setModalAgreement] = useState<CustomerAgreement | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

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
      const [taskList, agreementList] = await Promise.all([
        fetchEventPlanTasks(planId),
        getAgreements(planId),
      ]);
      setTasks(taskList);
      setAgreements(agreementList);
    } catch (err) {
      logApiError("Event tasks / agreements", err);
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
    void load();
    void loadBudget();
  }, [load, loadBudget]);

  async function syncTaskStatus(task: EventTask, status: EventTaskStatus) {
    if (task.id == null) return;
    await updateEventPlanTask(
      planId,
      task.id,
      buildTaskUpdateFromExisting(task, { status }),
    );
  }

  function openAgreementModal(task: EventTask, agreement?: CustomerAgreement) {
    setModalTask(task);
    setModalAgreement(agreement ?? null);
    setModalOpen(true);
  }

  function closeAgreementModal() {
    setModalOpen(false);
    setModalTask(null);
    setModalAgreement(null);
  }

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
    const linked = agreementForTask(agreements, task.id);
    if (linked && status !== "Done") {
      setError(
        "Bu madde için aktif anlaşma var. Önce «Anlaşmayı Kaldır» ile anlaşmayı silin.",
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
      await syncTaskStatus(task, status);
      await refreshAll();
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
    const linked = agreementForTask(agreements, task.id);
    if (linked?.id != null) {
      setError("Görev silinmeden önce anlaşmayı kaldırın.");
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

  async function handleRemoveAgreement(task: EventTask, agreement: CustomerAgreement) {
    if (agreement.id == null || task.id == null) return;
    setRemovingAgreementId(agreement.id);
    setError(null);
    try {
      await deleteAgreement(planId, agreement.id);
      if (normalizeTaskStatus(task.status) === "Done") {
        try {
          await syncTaskStatus(task, "Todo");
        } catch (syncErr) {
          logApiError("Revert task after agreement remove", syncErr);
        }
      }
      toast.success("Anlaşma kaldırıldı.");
      await refreshAll();
    } catch (err) {
      logApiError("Delete agreement", err);
      setError(formatUiErrorMessage(err, "Anlaşma kaldırılamadı."));
    } finally {
      setRemovingAgreementId(null);
    }
  }

  async function handleAgreementSaved() {
    if (modalTask?.id != null && normalizeTaskStatus(modalTask.status) !== "Done") {
      try {
        await syncTaskStatus(modalTask, "Done");
      } catch (syncErr) {
        logApiError("Mark task done after agreement", syncErr);
      }
    }
    toast.success(
      modalAgreement?.id != null ? "Anlaşma güncellendi." : "Anlaşma kaydedildi.",
    );
    await refreshAll();
  }

  const progress = taskProgressPercent(tasks, selectedPlan);

  const tasksWithAgreement = useMemo(() => {
    return tasks.map((task) => ({
      task,
      agreement: agreementForTask(agreements, task.id),
    }));
  }, [tasks, agreements]);

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <EventOsProgressBar percent={progress} />
      <EventOsBudgetSummary
        summary={budget}
        loading={budgetLoading}
        error={budgetError}
        onRetry={() => void loadBudget()}
      />
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
          {tasksWithAgreement.map(({ task, agreement }) => {
            const current = normalizeTaskStatus(task.status);
            const hasAgreement = agreement != null;
            const displayDone = hasAgreement || current === "Done";

            return (
              <li
                key={String(task.id)}
                className={`rounded-xl border px-4 py-3 ${
                  hasAgreement
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
                    {hasAgreement ? (
                      <p className="mt-1.5 text-sm font-medium text-emerald-200/90">
                        {formatAgreementSummary(agreement)}
                      </p>
                    ) : null}
                    {task.description?.trim() ? (
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
                  <button
                    type="button"
                    className="text-[11px] text-zinc-600 hover:text-red-300"
                    onClick={() => void handleDelete(task)}
                  >
                    Kaldır
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {hasAgreement ? (
                    <>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-emerald-400/30">
                        Anlaşıldı
                      </span>
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() => openAgreementModal(task, agreement)}
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-red-400/30 px-2.5 py-1 text-[11px] font-medium text-red-200/90 transition hover:bg-red-500/10"
                        disabled={removingAgreementId === agreement.id}
                        onClick={() => void handleRemoveAgreement(task, agreement)}
                      >
                        {removingAgreementId === agreement.id
                          ? "Kaldırılıyor…"
                          : "Vazgeç / Anlaşmayı Kaldır"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => openAgreementModal(task)}
                    >
                      Anlaşma Ekle
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                  {EVENT_TASK_STATUSES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={savingId === task.id || (hasAgreement && value !== "Done")}
                      onClick={() => void setStatus(task, value)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        (hasAgreement && value === "Done") || current === value
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

      <CustomerAgreementModal
        open={modalOpen}
        planId={planId}
        task={modalTask}
        agreement={modalAgreement}
        onClose={closeAgreementModal}
        onSuccess={() => void handleAgreementSaved()}
      />
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
