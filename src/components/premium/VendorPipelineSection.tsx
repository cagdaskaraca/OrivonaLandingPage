"use client";

import { useState } from "react";
import {
  fetchVendorPipeline,
  updateVendorLeadStage,
  type VendorPipelineLead,
} from "@/src/lib/api/premiumSaas";
import { logApiError } from "@/src/lib/api/client";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { PIPELINE_STAGE_OPTIONS } from "@/src/lib/premiumLabels";
import { VENDOR_EMPTY_DATA } from "@/src/lib/vendorCrm";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { glassCard, orivonaScrollX, selectClass } from "@/src/lib/ui";

export function VendorPipelineSection() {
  const { data: pipeline, loading, error, reload: load } = useVendorSectionLoad(
    fetchVendorPipeline,
  );
  const leads = pipeline?.leads ?? [];
  const [stageError, setStageError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

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

  return (
    <VendorSectionState
      loading={loading}
      error={error}
      onRetry={load}
      isEmpty={!loading && !error && leads.length === 0}
      empty={
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
          {VENDOR_EMPTY_DATA}
        </p>
      }
    >
      {stageError ? (
        <p className="mb-4 text-sm text-red-300/90">{stageError}</p>
      ) : null}
      <div className={`${orivonaScrollX} flex gap-4 pb-2`}>
        {PIPELINE_STAGE_OPTIONS.map((stage) => {
          const stageLeads = leads.filter(
            (l) => (l.stage ?? "New").toLowerCase() === stage.value.toLowerCase(),
          );
          return (
            <div
              key={stage.value}
              className={`${glassCard} min-w-[240px] flex-shrink-0 !p-4`}
            >
              <h3 className="text-sm font-semibold text-violet-200">{stage.label}</h3>
              <p className="text-xs text-zinc-500">{stageLeads.length} lead</p>
              <ul className="mt-3 space-y-2">
                {stageLeads.map((lead) => (
                  <li
                    key={String(lead.id)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"
                  >
                    <p className="font-medium text-white">
                      {lead.customerMasked ?? lead.serviceTitle ?? "Lead"}
                    </p>
                    {lead.lastActivityAt ? (
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {formatRelativeTime(lead.lastActivityAt)}
                      </p>
                    ) : null}
                    <select
                      className={`${selectClass} mt-2 w-full text-xs`}
                      value={lead.stage ?? "New"}
                      disabled={updatingId === lead.id}
                      onChange={(e) => void changeStage(lead, e.target.value)}
                    >
                      {PIPELINE_STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </VendorSectionState>
  );
}
