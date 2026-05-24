"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { promoteAdminService } from "@/src/lib/api/commerce";
import { PROMOTION_TYPE_OPTIONS } from "@/src/lib/commerceUi";
import { formatUiErrorMessage } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

type PromoteServiceModalProps = {
  open: boolean;
  serviceId: string | number | null;
  serviceTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function PromoteServiceModal({
  open,
  serviceId,
  serviceTitle,
  onClose,
  onSuccess,
}: PromoteServiceModalProps) {
  const [promotionType, setPromotionType] = useState("Featured");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null) return;
    setLoading(true);
    setError(null);
    try {
      await promoteAdminService(serviceId, {
        promotionType,
        startDate,
        endDate,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Tanıtım oluşturulamadı."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title={`Hizmeti tanıt — ${serviceTitle ?? ""}`}
      onClose={onClose}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <p className="text-xs text-zinc-500">
          Ödeme işlemi yapılmaz; görünürlük ayarı platform üzerinden uygulanır.
        </p>
        <label className="block text-sm">
          <span className="mb-1 text-xs text-zinc-500">Tanıtım türü</span>
          <select
            className={selectClass}
            value={promotionType}
            onChange={(e) => setPromotionType(e.target.value)}
          >
            {PROMOTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 text-xs text-zinc-500">Başlangıç</span>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 text-xs text-zinc-500">Bitiş</span>
          <input
            type="date"
            className={inputClass}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Kaydediliyor…" : "Tanıtımı başlat"}
          </button>
          <button type="button" className={btnSecondary} onClick={onClose}>
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
