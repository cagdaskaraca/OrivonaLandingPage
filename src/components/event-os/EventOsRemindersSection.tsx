"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  fetchEventPlanReminders,
  generateEventPlanReminders,
} from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventReminder } from "@/src/lib/api/types";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";
import { btnPrimary, btnSecondary } from "@/src/lib/ui";

function RemindersPanel({ planId }: { planId: string | number }) {
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReminders(await fetchEventPlanReminders(planId));
    } catch (err) {
      logApiError("Reminders", err);
      setReminders([]);
      setError(formatUiErrorMessage(err, "Hatırlatmalar yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const list = await generateEventPlanReminders(planId);
      setReminders(list);
    } catch (err) {
      setError(formatUiErrorMessage(err, "Hatırlatmalar oluşturulamadı."));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <p className="text-xs text-zinc-500">
        Oluşturulan hatırlatmalar planınıza göre listelenir (push bildirimi demo
        dışı).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          disabled={generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? "Oluşturuluyor…" : "Hatırlatmaları oluştur"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => void load()}>
          Yenile
        </button>
      </div>
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Hatırlatmalar yükleniyor…</p>
      ) : reminders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz hatırlatma yok. Oluştur butonuna basın.
        </p>
      ) : (
        <DashboardPaginatedList
          items={reminders}
          searchPlaceholder="Hatırlatma ara…"
          filterItem={(r, query) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const hay = [r.title, r.type, r.message, r.description]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          }}
          getItemKey={(r) =>
            String(r.id ?? `${r.title ?? "reminder"}-${r.dueDate ?? r.scheduledAt ?? ""}`)
          }
          renderItem={(r) => (
            <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.05] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{r.title ?? "Hatırlatma"}</p>
                {r.type?.trim() ? (
                  <span className="rounded-full border border-violet-400/25 px-2 py-0.5 text-[10px] text-violet-200">
                    {r.type}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm text-zinc-400">
                {r.message ?? r.description ?? ""}
              </p>
              {r.dueDate ?? r.scheduledAt ? (
                <p className="mt-2 text-xs text-zinc-500">
                  {r.dueDate ?? r.scheduledAt}
                </p>
              ) : null}
            </div>
          )}
        />
      )}
    </div>
  );
}

export function EventOsRemindersSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <RemindersPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
