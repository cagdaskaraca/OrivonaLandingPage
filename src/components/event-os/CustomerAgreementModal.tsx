"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { NumericInput } from "@/src/components/ui/NumericInput";
import {
  createAgreement,
  updateAgreement,
} from "@/src/lib/api/customerAgreements";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  CustomerAgreement,
  CustomerAgreementFormPayload,
  EventTask,
} from "@/src/lib/api/types";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

type CustomerAgreementModalProps = {
  open: boolean;
  planId: string | number;
  task: EventTask | null;
  agreement: CustomerAgreement | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function CustomerAgreementModal({
  open,
  planId,
  task,
  agreement,
  onClose,
  onSuccess,
}: CustomerAgreementModalProps) {
  const isEdit = agreement?.id != null;
  const [companyName, setCompanyName] = useState("");
  const [agreedPrice, setAgreedPrice] = useState(0);
  const [agreementDate, setAgreementDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      return;
    }
    const defaultName =
      agreement?.companyName?.trim() ||
      task?.categoryName?.trim() ||
      task?.title?.trim() ||
      "";
    setCompanyName(defaultName);
    setAgreedPrice(agreement?.agreedPrice ?? 0);
    setAgreementDate(
      agreement?.agreementDate?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
    );
    setNote(agreement?.note ?? "");
  }, [open, agreement, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (task?.id == null) {
      setError("Görev kimliği bulunamadı.");
      return;
    }
    if (!companyName.trim() || agreedPrice <= 0 || !agreementDate.trim()) {
      setError("Firma adı, ücret ve anlaşma tarihi zorunludur.");
      return;
    }
    const payload: CustomerAgreementFormPayload = {
      taskId: task.id,
      companyName: companyName.trim(),
      agreedPrice,
      agreementDate: agreementDate.trim(),
      note: note.trim(),
    };
    setLoading(true);
    setError(null);
    try {
      if (isEdit && agreement?.id != null) {
        await updateAgreement(planId, agreement.id, payload);
      } else {
        await createAgreement(planId, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        console.log("Customer agreement save failed", err.body);
      }
      setError(
        formatApiErrorMessage(
          err,
          isEdit ? "Anlaşma güncellenemedi." : "Anlaşma kaydedilemedi.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const taskLabel = task?.title ?? "Checklist maddesi";

  return (
    <Modal
      open={open}
      title={isEdit ? `Anlaşmayı Düzenle — ${taskLabel}` : `Anlaşma Ekle — ${taskLabel}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Firma adı</span>
          <input
            className={inputClass}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Örn. Fotoğrafçı, Pastacı"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Anlaşılan ücret (TL)</span>
          <NumericInput
            min={1}
            value={agreedPrice}
            onChange={setAgreedPrice}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Anlaşma tarihi</span>
          <input
            type="date"
            className={inputClass}
            value={agreementDate}
            onChange={(e) => setAgreementDate(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Not (isteğe bağlı)</span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ek detaylar…"
          />
        </label>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Anlaşmayı Kaydet"}
          </button>
          <button type="button" className={btnSecondary} onClick={onClose} disabled={loading}>
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
