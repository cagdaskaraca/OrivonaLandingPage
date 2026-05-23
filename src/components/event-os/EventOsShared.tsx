"use client";

import type { ReactNode } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { planDisplayTitle } from "@/src/lib/eventOs";
import { btnSecondary, selectClass } from "@/src/lib/ui";

export function EventOsPlanPicker({ className = "" }: { className?: string }) {
  const { plans, selectedPlanId, selectPlan, loadingPlans } = useEventOs();

  if (loadingPlans) {
    return <p className={`text-sm text-zinc-500 ${className}`}>Planlar yükleniyor…</p>;
  }

  if (plans.length === 0) {
    return (
      <p className={`text-sm text-amber-200/90 ${className}`}>
        Önce bir etkinlik planı oluşturun.
      </p>
    );
  }

  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block text-xs text-zinc-400">Aktif plan</span>
      <select
        className={selectClass}
        value={selectedPlanId != null ? String(selectedPlanId) : ""}
        onChange={(e) => selectPlan(e.target.value || null)}
      >
        {plans.map((p) => (
          <option key={String(p.id)} value={String(p.id)}>
            {planDisplayTitle(p)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EventOsNeedPlan({
  children,
}: {
  children: (planId: string | number) => ReactNode;
}) {
  const { selectedPlanId, loadingPlans, plans } = useEventOs();

  if (loadingPlans) {
    return <p className="text-sm text-zinc-500">Yükleniyor…</p>;
  }

  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] px-4 py-6 text-center text-sm text-zinc-400">
        Bu bölüm için önce &quot;Etkinlik Planlarım&quot; bölümünden bir plan
        oluşturun.
      </p>
    );
  }

  if (selectedPlanId == null) {
    return (
      <p className="text-sm text-zinc-500">Lütfen bir etkinlik planı seçin.</p>
    );
  }

  return <>{children(selectedPlanId)}</>;
}

export function EventOsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className={`${btnSecondary} mt-3 px-3 py-1.5 text-xs`}
          onClick={onRetry}
        >
          Tekrar dene
        </button>
      ) : null}
    </div>
  );
}

export function EventOsProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-zinc-400">İlerleme</span>
        <span className="font-semibold text-violet-100">%{clamped}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
