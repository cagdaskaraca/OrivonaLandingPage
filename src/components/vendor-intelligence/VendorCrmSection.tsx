"use client";

import { useEffect, useState } from "react";
import {
  addVendorLeadNote,
  fetchVendorLeads,
  updateVendorLeadStatus,
} from "@/src/lib/api/vendorIntelligence";
import { logApiError } from "@/src/lib/api/client";
import type { VendorLead } from "@/src/lib/api/types";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import {
  LEAD_FUNNEL_STAGES,
  leadStatusLabel,
  maskLeadCustomerName,
  normalizeLeadStatusKey,
  VENDOR_EMPTY_DATA,
} from "@/src/lib/vendorCrm";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

export function VendorCrmSection() {
  const { data, loading, error, reload: load } = useVendorSectionLoad(
    fetchVendorLeads,
  );
  const leads = data ?? [];
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (leads.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev != null && leads.some((l) => l.id === prev)) return prev;
      return leads[0]?.id ?? null;
    });
  }, [leads]);

  const selected = leads.find((l) => l.id === selectedId) ?? leads[0];

  useEffect(() => {
    if (selected) {
      setStatusDraft(normalizeLeadStatusKey(selected.status));
      setNoteText("");
    }
  }, [selected?.id, selected?.status]);

  async function handleStatusUpdate() {
    if (selected?.id == null || !statusDraft) return;
    setSaving(true);
    setActionError(null);
    try {
      await updateVendorLeadStatus(selected.id, statusDraft);
      await load();
    } catch (err) {
      logApiError("Vendor CRM status update", err);
      setActionError("Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (selected?.id == null || !noteText.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      await addVendorLeadNote(selected.id, noteText.trim());
      setNoteText("");
      await load();
    } catch (err) {
      logApiError("Vendor CRM note", err);
      setActionError("Not eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <VendorSectionState
      loading={loading}
      error={error}
      onRetry={load}
      isEmpty={!loading && !error && leads.length === 0}
      empty={
        <p className="rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] px-4 py-8 text-center text-sm text-zinc-500">
          {VENDOR_EMPTY_DATA}
        </p>
      }
    >
      {actionError ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {actionError}
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li key={String(lead.id)}>
              <button
                type="button"
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  lead.id === selected?.id
                    ? "border-violet-400/40 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-violet-400/25"
                }`}
                onClick={() => setSelectedId(lead.id ?? null)}
              >
                <p className="font-medium">{maskLeadCustomerName(lead)}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {leadStatusLabel(lead.status)}
                  {lead.serviceTitle ? ` · ${lead.serviceTitle}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-lg font-semibold text-white">
              {maskLeadCustomerName(selected)}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              {selected.serviceTitle ?? "Hizmet belirtilmedi"}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-500">Durum</span>
                <select
                  className={selectClass}
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                >
                  {LEAD_FUNNEL_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={`${btnPrimary} text-xs`}
                disabled={saving}
                onClick={() => void handleStatusUpdate()}
              >
                Durumu güncelle
              </button>
            </div>
            <div className="mt-6">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-500">Not ekle</span>
                <input
                  className={inputClass}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="İç not…"
                />
              </label>
              <button
                type="button"
                className={`${btnSecondary} mt-2 text-xs`}
                disabled={saving || !noteText.trim()}
                onClick={() => void handleAddNote()}
              >
                Not kaydet
              </button>
            </div>
            {selected.notes?.trim() ? (
              <div className="mt-6 border-t border-white/10 pt-4 text-sm text-zinc-400">
                <p className="rounded-lg bg-white/[0.03] px-3 py-2 whitespace-pre-wrap">
                  {selected.notes}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </VendorSectionState>
  );
}
