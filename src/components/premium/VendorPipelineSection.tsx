"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchVendorPipeline,
  updateVendorLeadStage,
  type VendorPipelineLead,
} from "@/src/lib/api/premiumSaas";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import { PIPELINE_STAGE_OPTIONS } from "@/src/lib/premiumLabels";
import {
  VENDOR_EMPTY_DATA,
  VENDOR_PIPELINE_LOAD_ERROR,
} from "@/src/lib/vendorCrm";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { btnSecondary, glassCard, orivonaScrollX, selectClass } from "@/src/lib/ui";

export function VendorPipelineSection() {
  const [leads, setLeads] = useState<VendorPipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setUnavailable(false);
    try {
      const pipeline = await fetchVendorPipeline();
      console.log("Vendor pipeline response", pipeline);
      if (!pipeline) {
        setUnavailable(true);
        setLeads([]);
        return;
      }
      setLeads(pipeline.leads ?? []);
    } catch (err) {
      logApiError("Vendor pipeline", err);
      if (isApiNotFound(err)) {
        setUnavailable(true);
        setLeads([]);
      } else {
        setLoadFailed(true);
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStage(lead: VendorPipelineLead, stage: string) {
    setUpdatingId(lead.id);
    setStageError(null);
    try {
      await updateVendorLeadStage(lead.id, stage);
      await load();
    } catch (err) {
      logApiError("Lead stage update", err);
      setStageError("Aşama güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>;
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Pipeline yükleniyor…</p>;
  }

  if (loadFailed) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>{VENDOR_PIPELINE_LOAD_ERROR}</p>
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

  const columns = PIPELINE_STAGE_OPTIONS.map((col) => ({
    ...col,
    leads: leads.filter(
      (l) => l.stage.toLowerCase() === col.value.toLowerCase(),
    ),
  }));

  const totalLeads = leads.length;

  return (
    <div className="space-y-3">
      {totalLeads === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          {VENDOR_EMPTY_DATA}
        </p>
      ) : null}

      <div className={`${glassCard} overflow-hidden !p-3 sm:!p-4`}>
        <div
          className={`orivona-pipeline-board ${orivonaScrollX} lg:overflow-x-visible`}
        >
          <div className="orivona-pipeline-grid">
            {columns.map((col) => (
              <div
                key={col.value}
                className="orivona-pipeline-column flex min-h-[14rem] min-w-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
              >
                <h3 className="mb-3 shrink-0 text-[10px] font-semibold uppercase leading-tight tracking-wider text-violet-300/90">
                  {col.label}
                  <span className="ml-1 font-normal text-zinc-600">
                    ({col.leads.length})
                  </span>
                </h3>
                <ul className="flex min-h-0 flex-1 flex-col gap-2">
                  {col.leads.length === 0 ? (
                    <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.06] px-2 py-6 text-center text-xs text-zinc-600">
                      Boş
                    </li>
                  ) : (
                    col.leads.map((lead) => (
                      <li
                        key={String(lead.id)}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5"
                      >
                        <p className="text-sm font-medium leading-snug text-white">
                          {lead.customerMasked ?? "Müşteri"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
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
                          className={`${selectClass} mt-2 w-full text-xs`}
                          value={lead.stage}
                          disabled={updatingId === lead.id}
                          onChange={(e) =>
                            void changeStage(lead, e.target.value)
                          }
                        >
                          {PIPELINE_STAGE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stageError ? (
        <p className="text-xs text-red-300/90">{stageError}</p>
      ) : null}
    </div>
  );
}
