"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVendorLeadNote,
  fetchVendorLeads,
  updateVendorLeadStatus,
} from "@/src/lib/api/vendorIntelligence";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { VendorLead } from "@/src/lib/api/types";
import {
  LEAD_FUNNEL_STAGES,
  leadStatusLabel,
  maskLeadCustomerName,
  normalizeLeadStatusKey,
  VENDOR_CRM_LOAD_ERROR,
  VENDOR_EMPTY_DATA,
} from "@/src/lib/vendorCrm";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

export function VendorCrmSection() {
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setActionError(null);
    try {
      const list = await fetchVendorLeads();
      setLeads(list);
      setSelectedId((prev) => {
        if (prev != null && list.some((l) => l.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      logApiError("Vendor CRM", err);
      setLeads([]);
      setLoadFailed(!isApiNotFound(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  if (loading) {
    return <p className="text-sm text-zinc-500">CRM yükleniyor…</p>;
  }

  if (loadFailed) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>{VENDOR_CRM_LOAD_ERROR}</p>
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

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] px-4 py-8 text-center text-sm text-zinc-500">
        {VENDOR_EMPTY_DATA}
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,320px)]">
      <div className="orivona-scroll-x mt-0 rounded-xl border border-white/10 pb-0.5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Hizmet</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Skor</th>
              <th className="px-4 py-3 font-medium">Son aktivite</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const active = lead.id === (selected?.id ?? selectedId);
              return (
                <tr
                  key={String(lead.id)}
                  className={`cursor-pointer border-b border-white/[0.06] transition last:border-0 ${
                    active ? "bg-violet-500/10" : "hover:bg-white/[0.03]"
                  }`}
                  onClick={() => lead.id != null && setSelectedId(lead.id)}
                >
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {maskLeadCustomerName(lead)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {lead.serviceTitle ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-100">
                      {leadStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {lead.score != null ? Math.round(lead.score) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {lead.lastActivityAt ?? lead.lastActivity ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected ? (
        <aside className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-4">
          <h3 className="text-sm font-semibold text-white">Lead detayı</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {maskLeadCustomerName(selected)} · {selected.serviceTitle ?? "—"}
          </p>
          {selected.notes?.trim() || selected.note?.trim() ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400">
              {selected.notes ?? selected.note}
            </p>
          ) : null}
          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-xs text-zinc-400">Durum</span>
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
            className={`${btnSecondary} mt-2 w-full text-xs`}
            disabled={saving}
            onClick={() => void handleStatusUpdate()}
          >
            Durumu güncelle
          </button>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-xs text-zinc-400">Not ekle</span>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y text-sm`}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Görüşme notu…"
            />
          </label>
          <button
            type="button"
            className={`${btnPrimary} mt-2 w-full text-xs`}
            disabled={saving || !noteText.trim()}
            onClick={() => void handleAddNote()}
          >
            Not kaydet
          </button>
          {actionError ? (
            <p className="mt-3 text-xs text-red-300/90">{actionError}</p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
