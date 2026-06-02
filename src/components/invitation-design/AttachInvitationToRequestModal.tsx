"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { attachInvitationDesignToEventRequest } from "@/src/lib/api/invitationDesigns";
import { fetchCustomerEventRequests } from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventRequest, InvitationDesign } from "@/src/lib/api/types";
import { invitationDesignTitle } from "@/src/lib/invitationDesign";
import { btnPrimary, selectClass } from "@/src/lib/ui";

type AttachInvitationToRequestModalProps = {
  design: InvitationDesign | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AttachInvitationToRequestModal({
  design,
  open,
  onClose,
  onSuccess,
}: AttachInvitationToRequestModalProps) {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchCustomerEventRequests();
      setRequests(list);
      if (list[0]?.id != null) setRequestId(String(list[0].id));
    } catch (err) {
      logApiError("Event requests for attach", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (design?.id == null || !requestId) {
      setError("Talep ve tasarım seçilmelidir.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await attachInvitationDesignToEventRequest(requestId, design.id);
      onSuccess();
      onClose();
    } catch (err) {
      logApiError("Attach invitation design", err);
      setError(formatUiErrorMessage(err, "Tasarım talebe eklenemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Teklif talebine ekle"
      onClose={submitting ? undefined : onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-zinc-400">
          <span className="text-violet-200">
            {design ? invitationDesignTitle(design) : "Tasarım"}
          </span>{" "}
          seçili etkinlik talebine bağlanacak.
        </p>
        {loading ? (
          <p className="text-sm text-zinc-500">Talepler yükleniyor…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-amber-200/90">
            Henüz etkinlik talebiniz yok. Önce Tedarikçi / Teklifler bölümünden
            talep oluşturun.
          </p>
        ) : (
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik talebi</span>
            <select
              className={selectClass}
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              required
            >
              {requests.map((r) =>
                r.id != null ? (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.title?.trim() || r.eventType || `Talep #${r.id}`}
                  </option>
                ) : null,
              )}
            </select>
          </label>
        )}
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={`${btnPrimary} w-full`}
          disabled={submitting || requests.length === 0 || design?.id == null}
        >
          {submitting ? "Ekleniyor…" : "Talebe bağla"}
        </button>
      </form>
    </Modal>
  );
}
