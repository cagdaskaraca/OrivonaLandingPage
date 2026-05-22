"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { btnSecondary, inputClass } from "@/src/lib/ui";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/18 disabled:opacity-50";

type AdminVendorRejectModalProps = {
  open: boolean;
  businessName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function AdminVendorRejectModal({
  open,
  businessName,
  loading,
  onClose,
  onConfirm,
}: AdminVendorRejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(reason.trim());
  }

  return (
    <Modal
      open={open}
      title={businessName ? `Reddet — ${businessName}` : "İşletmeyi reddet"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-zinc-400">
          İsteğe bağlı olarak red gerekçesi ekleyebilirsiniz. Kullanıcı hesabı
          pasifleştirilmez; yalnızca onay durumu güncellenir.
        </p>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Red gerekçesi</span>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Örn. Eksik belgeler, uyumsuz profil…"
            maxLength={1000}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnDanger} disabled={loading}>
            {loading ? "Gönderiliyor…" : "Reddet"}
          </button>
          <button type="button" className={btnSecondary} onClick={onClose}>
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
