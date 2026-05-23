"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchVendorAnalyticsLeads,
  fetchVendorAnalyticsServices,
  fetchVendorAnalyticsSummary,
} from "@/src/lib/api/vendorIntelligence";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  VendorAnalyticsSummary,
  VendorLeadFunnelStage,
  VendorServicePerformance,
} from "@/src/lib/api/types";
import {
  buildFunnelCounts,
  formatPercent,
  formatResponseTime,
  formatTryAmount,
} from "@/src/lib/vendorCrm";
import { btnSecondary, skeletonClass } from "@/src/lib/ui";

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
  const [summary, setSummary] = useState<VendorAnalyticsSummary | null>(null);
  const [services, setServices] = useState<VendorServicePerformance[]>([]);
  const [funnelStages, setFunnelStages] = useState<VendorLeadFunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, svc, funnel] = await Promise.all([
        fetchVendorAnalyticsSummary(),
        fetchVendorAnalyticsServices(),
        fetchVendorAnalyticsLeads(),
      ]);
      setSummary(s);
      setServices(svc);
      setFunnelStages(funnel);
    } catch (err) {
      logApiError("Vendor analytics", err);
      setSummary(null);
      setServices([]);
      setFunnelStages([]);
      setError(formatUiErrorMessage(err, "Analitik veriler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        <p className="text-sm text-zinc-500">Analitik yükleniyor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>{error}</p>
        <button
          type="button"
          className={`${btnSecondary} mt-3 text-xs`}
          onClick={() => void load()}
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  const reservations =
    summary?.reservations ?? summary?.totalReservations ?? 0;

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
            Henüz lead verisi yok.
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
            Performans verisi bulunamadı.
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
                    <td className="px-4 py-3 text-zinc-400">
                      {row.views ?? 0}
                    </td>
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
}
