"use client";

import { EventOsNeedPlan } from "@/src/components/event-os/EventOsShared";
import { EventOsTablePlanView } from "@/src/components/event-os/table-plan/EventOsTablePlanView";
import { glassCard } from "@/src/lib/ui";

export function EventOsSeatingSection() {
  return (
    <div className={glassCard}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Masa planı</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Salonu kuş bakışı düzenleyin, masaları yerleştirin ve sandalyelere
          davetlileri atayın.
        </p>
      </div>
      <EventOsNeedPlan>
        {(planId) => <EventOsTablePlanView planId={planId} />}
      </EventOsNeedPlan>
    </div>
  );
}
