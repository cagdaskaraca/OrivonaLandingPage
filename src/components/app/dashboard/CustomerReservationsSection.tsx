"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyReservations } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { Reservation } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { CustomerReservationRow } from "@/src/components/reservations/CustomerReservationRow";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";

export function CustomerReservationsSection() {
  const toast = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReservations(await fetchMyReservations());
    } catch (e) {
      logApiError("Customer reservations", e);
      setReservations([]);
      if (!isApiNotFound(e)) toast.error("Rezervasyonlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-zinc-500">Yükleniyor…</p>;
  if (reservations.length === 0) {
    const preset = EMPTY_STATE_PRESETS.reservationsCustomer;
    return (
      <EmptyState
        icon={preset.icon}
        title={preset.title}
        description={preset.description}
        actionLabel={preset.actionLabel}
        onAction={() => {
          document.getElementById(preset.sectionId ?? "")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
      />
    );
  }

  return (
    <DashboardPaginatedList
      items={reservations}
      listClassName="space-y-2"
      searchPlaceholder="Rezervasyon ara…"
      filterItem={(r, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const hay = [r.serviceTitle, r.vendorName, r.eventDate, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }}
      getItemKey={(r) => String(r.id)}
      renderItem={(r) => (
        <CustomerReservationRow reservation={r} onRefresh={load} />
      )}
    />
  );
}
