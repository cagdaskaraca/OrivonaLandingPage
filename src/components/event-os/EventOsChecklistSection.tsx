"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
  EventOsProgressBar,
} from "@/src/components/event-os/EventOsShared";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  createEventPlanTask,
  deleteEventPlanTask,
  fetchEventPlanTasks,
  generateEventPlanTasks,
  updateEventPlanTask,
} from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventTask, EventTaskStatus } from "@/src/lib/api/types";
import {
  EVENT_TASK_STATUSES,
  normalizeTaskStatus,
  taskProgressPercent,
} from "@/src/lib/eventOs";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

function ChecklistPanel({ planId }: { planId: string | number }) {
  const { selectedPlan } = useEventOs();
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await fetchEventPlanTasks(planId));
    } catch (err) {
      logApiError("Event tasks", err);
      setTasks([]);
      setError(formatUiErrorMessage(err, "Görevler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const list = await generateEventPlanTasks(planId);
      setTasks(list);
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
    setSavingId(task.id);
    try {
      await updateEventPlanTask(planId, task.id, { status });
      await load();
    } catch (err) {
      logApiError("Update task status", err);
      setError(formatUiErrorMessage(err, "Durum güncellenemedi."));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(task: EventTask) {
    if (task.id == null) return;
    try {
      await deleteEventPlanTask(planId, task.id);
      await load();
    } catch (err) {
      logApiError("Delete task", err);
      setError(formatUiErrorMessage(err, "Görev silinemedi."));
    }
  }

  const progress = taskProgressPercent(tasks, selectedPlan);

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <EventOsProgressBar percent={progress} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          disabled={generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? "Oluşturuluyor…" : "AI Checklist Oluştur"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => void load()}>
          Yenile
        </button>
      </div>
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Checklist yükleniyor…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz görev yok. AI ile oluşturun veya manuel ekleyin.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const current = normalizeTaskStatus(task.status);
            return (
              <li
                key={String(task.id)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">
                      {task.title ?? "Görev"}
                    </p>
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
