"use client";

import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { formatPlanOptionLabel } from "@/src/lib/customerAgreementsUi";
import { selectClass } from "@/src/lib/ui";

/** Checklist üstü — etkinlik adı + tarih ile plan seçimi. */
export function EventOsChecklistPlanDropdown({ className = "" }: { className?: string }) {
  const { plans, selectedPlanId, selectPlan, loadingPlans } = useEventOs();

  if (loadingPlans) {
    return <p className={`text-sm text-zinc-500 ${className}`}>Planlar yükleniyor…</p>;
  }

  if (plans.length === 0) {
    return (
      <p className={`text-sm text-amber-200/90 ${className}`}>
        Önce &quot;Etkinlik Planlarım&quot; bölümünden bir plan oluşturun.
      </p>
    );
  }

  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik planı</span>
      <select
        className={selectClass}
        value={selectedPlanId != null ? String(selectedPlanId) : ""}
        onChange={(e) => selectPlan(e.target.value || null)}
      >
        {plans.map((p) => (
          <option key={String(p.id)} value={String(p.id)}>
            {formatPlanOptionLabel(p.title ?? p.eventType, p.eventDate)}
          </option>
        ))}
      </select>
    </label>
  );
}
