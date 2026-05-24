"use client";

import { useCallback } from "react";
import {
  fetchVendorAnalyticsLeads,
  fetchVendorAnalyticsMonthly,
  fetchVendorAnalyticsServices,
  fetchVendorAnalyticsSummary,
} from "@/src/lib/api/vendorIntelligence";
import {
  VendorSectionLoadError,
  VENDOR_LOADING_MESSAGE,
  VENDOR_SECTION_ERROR,
} from "@/src/lib/api/vendorDashboardFetch";
import type {
  VendorAnalyticsSummary,
  VendorLeadFunnelStage,
  VendorMonthlyAnalytics,
  VendorServicePerformance,
} from "@/src/lib/api/types";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import {
  buildFunnelCounts,
  formatPercent,
  formatResponseTime,
  formatTryAmount,
  VENDOR_EMPTY_DATA,
} from "@/src/lib/vendorCrm";
import { skeletonClass } from "@/src/lib/ui";

type AnalyticsBundle = {
  summary: VendorAnalyticsSummary | null;
  services: VendorServicePerformance[];
  funnelStages: VendorLeadFunnelStage[];
  monthly: VendorMonthlyAnalytics[];
};

async function loadVendorAnalytics(): Promise<AnalyticsBundle> {
  const [summaryRes, servicesRes, funnelRes, monthlyRes] =
    await Promise.allSettled([
      fetchVendorAnalyticsSummary(),
      fetchVendorAnalyticsServices(),
      fetchVendorAnalyticsLeads(),
      fetchVendorAnalyticsMonthly(),
    ]);

  let anyOk = false;
  let anyHardFail = false;

  let summary: VendorAnalyticsSummary | null = null;
  let services: VendorServicePerformance[] = [];
  let funnelStages: VendorLeadFunnelStage[] = [];
  let monthly: VendorMonthlyAnalytics[] = [];

  if (summaryRes.status === "fulfilled") {
    summary = summaryRes.value;
    anyOk = true;
  } else if (summaryRes.reason instanceof VendorSectionLoadError) {
    anyHardFail = true;
  }

  if (servicesRes.status === "fulfilled") {
    services = servicesRes.value;
    anyOk = true;
  } else if (servicesRes.reason instanceof VendorSectionLoadError) {
    anyHardFail = true;
  }

  if (funnelRes.status === "fulfilled") {
    funnelStages = funnelRes.value;
    anyOk = true;
  } else if (funnelRes.reason instanceof VendorSectionLoadError) {
    anyHardFail = true;
  }

  if (monthlyRes.status === "fulfilled") {
    monthly = monthlyRes.value;
    anyOk = true;
  } else if (monthlyRes.reason instanceof VendorSectionLoadError) {
    anyHardFail = true;
  }

  if (anyHardFail && !anyOk) {
    throw new VendorSectionLoadError(VENDOR_SECTION_ERROR.analytics);
  }

  return { summary, services, funnelStages, monthly };
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-transparent px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

export function VendorAnalyticsSection() {
  const fetcher = useCallback(() => loadVendorAnalytics(), []);
  const { data, loading, error, reload } = useVendorSectionLoad(fetcher);

  const summary = data?.summary ?? null;
  const services = data?.services ?? [];
  const funnelStages = data?.funnelStages ?? [];
  const monthly = data?.monthly ?? [];
  const funnel = buildFunnelCounts([], funnelStages);
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`${skeletonClass} h-20 rounded-xl`} />
          ))}
        </div>
        <p className="animate-pulse text-sm text-zinc-500">{VENDOR_LOADING_MESSAGE}</p>
      </div>
    );
  }

  return (
    <VendorSectionState loading={false} error={error} onRetry={reload}>
      {(() => {
        const reservations =
          summary?.reservations ?? summary?.totalReservations ?? 0;

        const hasAnyData =
          (summary?.totalViews ?? 0) > 0 ||
          (summary?.totalMessages ?? 0) > 0 ||
          (summary?.totalOffers ?? 0) > 0 ||
          services.length > 0 ||
          funnel.some((f) => f.count > 0) ||
          monthly.length > 0;

        if (!hasAnyData) {
          return (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
              {VENDOR_EMPTY_DATA}
            </p>
          );
        }

        return (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Toplam görüntülenme"
                value={(summary?.totalViews ?? 0).toLocaleString("tr-TR")}
              />
              <MetricCard
                label="Toplam mesaj"
                value={(summary?.totalMessages ?? 0).toLocaleString("tr-TR")}
              />
              <MetricCard
                label="Toplam teklif"
                value={(summary?.totalOffers ?? 0).toLocaleString("tr-TR")}
              />
              <MetricCard
                label="Rezervasyon"
                value={reservations.toLocaleString("tr-TR")}
              />
              <MetricCard
                label="Dönüşüm oranı"
                value={formatPercent(summary?.conversionRate)}
              />
              <MetricCard
                label="Tahmini gelir"
                value={formatTryAmount(summary?.estimatedRevenue)}
              />
              <MetricCard
                label="Ortalama cevap süresi"
                value={formatResponseTime(summary ?? undefined)}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-violet-200/90">Lead hunisi</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Yeni → İletişim → Teklif → Kazanıldı / Kaybedildi
              </p>
              {funnel.every((f) => f.count === 0) ? (
                <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
                  {VENDOR_EMPTY_DATA}
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  {funnel.map((stage) => (
                    <div
                      key={stage.value}
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                        {stage.label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{stage.count}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                          style={{
                            width: `${Math.max(8, (stage.count / maxFunnel) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-violet-200/90">
                Hizmet performansı
              </h3>
              {services.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
                  {VENDOR_EMPTY_DATA}
                </p>
              ) : (
                <div className="orivona-scroll-x mt-4 rounded-xl border border-white/10 pb-0.5">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
                        <th className="px-4 py-3 font-medium">Hizmet</th>
                        <th className="px-4 py-3 font-medium">Görüntülenme</th>
                        <th className="px-4 py-3 font-medium">Mesaj</th>
                        <th className="px-4 py-3 font-medium">Teklif</th>
                        <th className="px-4 py-3 font-medium">Dönüşüm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((row, i) => (
                        <tr
                          key={String(row.serviceId ?? row.vendorServiceId ?? i)}
                          className="border-b border-white/[0.06] last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-zinc-100">
                            {row.serviceTitle ?? row.title ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{row.views ?? 0}</td>
                          <td className="px-4 py-3 text-zinc-400">
                            {row.messages ?? 0}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {row.offers ?? 0}
                          </td>
                          <td className="px-4 py-3 text-violet-200/90">
                            {formatPercent(row.conversionRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </VendorSectionState>
  );
}
