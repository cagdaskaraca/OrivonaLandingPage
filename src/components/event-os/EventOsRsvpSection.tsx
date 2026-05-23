"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { fetchRsvpSummary } from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { RsvpSummary } from "@/src/lib/api/types";

const RSVP_CARDS = [
  { key: "total" as const, label: "Toplam davetli", color: "text-white" },
  { key: "attending" as const, label: "Katılıyor", color: "text-emerald-300" },
  { key: "notAttending" as const, label: "Katılmıyor", color: "text-red-300" },
  { key: "maybe" as const, label: "Kararsız", color: "text-amber-200" },
  { key: "pending" as const, label: "Bekliyor", color: "text-violet-200" },
];

function RsvpPanel({ planId }: { planId: string | number }) {
  const { dataRefreshKey } = useEventOs();
  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await fetchRsvpSummary(planId));
    } catch (err) {
      logApiError("RSVP summary", err);
      setSummary(null);
      setError(formatUiErrorMessage(err, "RSVP özeti yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load, dataRefreshKey]);

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">RSVP özeti yükleniyor…</p>
      ) : !summary ? (
        <p className="text-sm text-zinc-500">Özet bulunamadı.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RSVP_CARDS.map(({ key, label, color }) => (
            <div
              key={key}
              className="rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-transparent px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>
                {summary[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EventOsRsvpSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <RsvpPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
