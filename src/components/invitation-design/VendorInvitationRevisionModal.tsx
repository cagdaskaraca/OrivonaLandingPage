"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { uploadVendorInvitationRevision } from "@/src/lib/api/invitationDesigns";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, inputClass } from "@/src/lib/ui";

type VendorInvitationRevisionModalProps = {
  requestId: string | number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function VendorInvitationRevisionModal({
  requestId,
  open,
  onClose,
  onSuccess,
}: VendorInvitationRevisionModalProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = document.getElementById(
      "vendor-invitation-revision-file",
    ) as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file || requestId == null) {
      setError("Lütfen bir dosya seçin.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await uploadVendorInvitationRevision(requestId, file, note);
      setNote("");
      if (input) input.value = "";
      onSuccess();
      onClose();
    } catch (err) {
      logApiError("Vendor invitation revision", err);
      setError(formatUiErrorMessage(err, "Revizyon yüklenemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Revizyon / taslak yükle"
      onClose={submitting ? undefined : onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Görsel veya PDF
          </span>
          <input
            id="vendor-invitation-revision-file"
            type="file"
            accept="image/*,application/pdf"
            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Not (isteğe bağlı)</span>
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Revizyon hakkında kısa not…"
          />
        </label>
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={submitting}>
          {submitting ? "Yükleniyor…" : "Yükle"}
        </button>
      </form>
    </Modal>
  );
}
