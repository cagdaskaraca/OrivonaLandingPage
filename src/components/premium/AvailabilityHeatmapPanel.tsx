"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchServiceAvailabilityHeatmap,
  fetchVendorAvailabilityHeatmap,
  type HeatmapMonth,
} from "@/src/lib/api/premiumSaas";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
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
  const vendorLoad = useVendorSectionLoad(fetchVendorAvailabilityHeatmap, {
    enabled: variant === "vendor",
  });

  const [serviceMonths, setServiceMonths] = useState<HeatmapMonth[]>([]);
  const [serviceLoading, setServiceLoading] = useState(variant === "service");
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  const loadService = useCallback(async () => {
    if (variant !== "service" || serviceId == null) return;
    setServiceLoading(true);
    setServiceUnavailable(false);
    try {
      setServiceMonths(await fetchServiceAvailabilityHeatmap(serviceId));
    } catch (err) {
      logApiError("Service heatmap", err);
      if (isApiNotFound(err)) setServiceUnavailable(true);
      setServiceMonths([]);
    } finally {
      setServiceLoading(false);
    }
  }, [variant, serviceId]);

  useEffect(() => {
    void loadService();
  }, [loadService]);

  if (variant === "service" && serviceId == null) {
    return null;
  }

  const months =
    variant === "vendor" ? (vendorLoad.data ?? []) : serviceMonths;
  const loading = variant === "vendor" ? vendorLoad.loading : serviceLoading;
  const error = variant === "vendor" ? vendorLoad.error : null;
  const onRetry = variant === "vendor" ? vendorLoad.reload : loadService;

  if (variant === "service" && serviceUnavailable) {
    return (
      <p className="text-sm text-zinc-500">Yoğunluk takvimi hazırlanıyor.</p>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-violet-200">
        Yoğunluk Takvimi
      </h3>
      <VendorSectionState
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={!loading && !error && months.length === 0}
        empty={<p className="text-sm text-zinc-500">Henüz veri yok.</p>}
      >
        {(() => {
          const fullMonths = months.filter(
            (m) => heatmapLevelLabel(m.level) === "Dolu",
          );
          return (
            <>
              {fullMonths.length > 0 && variant === "vendor" ? (
                <p className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  {fullMonths.length} ay tam dolu — kapasite planlamanızı gözden
                  geçirin.
                </p>
              ) : null}
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
            </>
          );
        })()}
      </VendorSectionState>
    </div>
  );
}
