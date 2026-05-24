"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchVendorPipeline,
  updateVendorLeadStage,
  type VendorPipelineLead,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { PIPELINE_STAGE_OPTIONS } from "@/src/lib/premiumLabels";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { glassCard, selectClass } from "@/src/lib/ui";

export function VendorPipelineSection() {
  const [leads, setLeads] = useState<VendorPipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pipeline = await fetchVendorPipeline();
      if (!pipeline) {
        setUnavailable(true);
        setLeads([]);
        return;
      }
      setLeads(pipeline.leads);
    } catch (err) {
      logApiError("Vendor pipeline", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Pipeline yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStage(lead: VendorPipelineLead, stage: string) {
    setUpdatingId(lead.id);
    try {
      await updateVendorLeadStage(lead.id, stage);
      await load();
    } catch (err) {
      logApiError("Lead stage update", err);
      setError(formatUiErrorMessage(err, "Aşama güncellenemedi."));
    } finally {
      setUpdatingId(null);
    }
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>;
  }

  if (loading) return <p className="text-sm text-zinc-500">Pipeline yükleniyor…</p>;
  if (error) return <p className="text-sm text-red-300/90">{error}</p>;

  const columns = PIPELINE_STAGE_OPTIONS.map((col) => ({
    ...col,
    leads: leads.filter((l) => l.stage.toLowerCase() === col.value.toLowerCase()),
  }));

  return (
    <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-3 xl:grid-cols-6">
      {columns.map((col) => (
        <div key={col.value} className={`${glassCard} min-w-[11rem] !p-4`}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
            {col.label}
          </h3>
          <ul className="space-y-2">
            {col.leads.map((lead) => (
              <li
                key={String(lead.id)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
              >
                <p className="text-sm font-medium text-white">
                  {lead.customerMasked ?? "Müşteri"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {lead.serviceTitle ?? "Hizmet"}
                </p>
                {lead.score != null ? (
                  <p className="mt-1 text-[10px] text-violet-300">
                    Skor: {Math.round(lead.score)}%
                  </p>
                ) : null}
                {lead.lastActivityAt ? (
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    {formatRelativeTime(lead.lastActivityAt)}
                  </p>
                ) : null}
                <select
                  className={`${selectClass} mt-2 text-xs`}
                  value={lead.stage}
                  disabled={updatingId === lead.id}
                  onChange={(e) => void changeStage(lead, e.target.value)}
                >
                  {PIPELINE_STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </li>
            ))}
            {col.leads.length === 0 ? (
              <li className="text-xs text-zinc-600">Boş</li>
            ) : null}
          </ul>
        </div>
      ))}
    </div>
  );
}
