"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchServiceAvailabilityHeatmap,
  fetchVendorAvailabilityHeatmap,
  type HeatmapMonth,
} from "@/src/lib/api/premiumSaas";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import { heatmapLevelLabel } from "@/src/lib/premiumLabels";
import { glassCard } from "@/src/lib/ui";

const levelClass: Record<string, string> = {
  Düşük: "border-emerald-400/25 bg-emerald-500/10",
  Orta: "border-amber-400/25 bg-amber-500/10",
  Yüksek: "border-orange-400/25 bg-orange-500/10",
  Dolu: "border-red-400/30 bg-red-500/15",
};

type AvailabilityHeatmapPanelProps = {
  variant: "service" | "vendor";
  serviceId?: string | number;
};

export function AvailabilityHeatmapPanel({
  variant,
  serviceId,
}: AvailabilityHeatmapPanelProps) {
  const [months, setMonths] = useState<HeatmapMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        variant === "service" && serviceId != null
          ? await fetchServiceAvailabilityHeatmap(serviceId)
          : await fetchVendorAvailabilityHeatmap();
      setMonths(data);
      if (data.length === 0) setUnavailable(false);
    } catch (err) {
      logApiError("Heatmap", err);
      if (isApiNotFound(err)) setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [variant, serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (variant === "service" && serviceId == null) {
    return null;
  }

  if (unavailable) {
    return (
      <p className="text-sm text-zinc-500">Yoğunluk takvimi hazırlanıyor.</p>
    );
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Takvim yükleniyor…</p>;
  }

  const fullMonths = months.filter((m) => heatmapLevelLabel(m.level) === "Dolu");

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-violet-200">
        Yoğunluk Takvimi
      </h3>
      {fullMonths.length > 0 && variant === "vendor" ? (
        <p className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {fullMonths.length} ay tam dolu — kapasite planlamanızı gözden geçirin.
        </p>
      ) : null}
      {months.length === 0 ? (
        <p className="text-sm text-zinc-500">Henüz veri yok.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {months.map((m, i) => {
            const label = heatmapLevelLabel(m.level);
            return (
              <div
                key={`${m.month}-${i}`}
                className={`${glassCard} !p-4 ${levelClass[label] ?? ""}`}
              >
                <p className="font-medium text-white">
                  {m.month}
                  {m.year ? ` ${m.year}` : ""}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{label}</p>
                {m.occupancyRate != null ? (
                  <p className="mt-2 text-lg font-semibold text-violet-100">
                    %{Math.round(m.occupancyRate)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
