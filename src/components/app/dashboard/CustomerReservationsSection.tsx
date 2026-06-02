"use client";

import { useCallback, useEffect, useState } from "react";
import { cancelReservation, fetchMyReservations } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { Reservation } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { btnSecondary } from "@/src/lib/ui";

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
    <ul className="space-y-2 text-sm">
      {reservations.map((r) => (
        <li
          key={String(r.id)}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
        >
          <div>
            <p className="font-medium text-white">{r.serviceTitle ?? "—"}</p>
            <p className="text-zinc-400">{r.eventDate}</p>
            {r.status ? (
              <div className="mt-1.5">
                <StatusBadge status={r.status} context="customer" />
              </div>
            ) : null}
          </div>
          {r.id != null && r.status !== "Cancelled" ? (
            <button
              type="button"
              className={`${btnSecondary} text-xs`}
              onClick={async () => {
                try {
                  await cancelReservation(r.id!);
                  toast.success("Rezervasyon iptal edildi.");
                  load();
                } catch (err) {
                  logApiError("Cancel reservation", err);
                  if (!isApiNotFound(err)) toast.error("İptal edilemedi.");
                }
              }}
            >
              İptal
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
