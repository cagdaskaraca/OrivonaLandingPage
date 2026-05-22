"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { sendVendorOffer } from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { OfferRequest } from "@/src/lib/api/types";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

type VendorSendOfferModalProps = {
  request: OfferRequest | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function VendorSendOfferModal({
  request,
  open,
  onClose,
  onSuccess,
}: VendorSendOfferModalProps) {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      return;
    }
    setPrice("");
    setDescription("");
    setValidUntil(
      new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    );
  }, [open, request?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (request?.id == null) {
      setError("Talep kimliği bulunamadı.");
      return;
    }
    if (!price.trim() || !description.trim()) {
      setError("Fiyat ve açıklama zorunludur.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendVendorOffer(request.id, {
        price: Number(price),
        description: description.trim(),
        validUntil: validUntil.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) console.log("Send vendor offer failed", err.body);
      setError(formatApiErrorMessage(err, "Fiyatlı teklif gönderilemedi."));
    } finally {
      setLoading(false);
    }
  }

  const title = request?.serviceTitle ?? "Teklif talebi";

  return (
    <Modal open={open} title={`Fiyatlı Teklif Gönder — ${title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Fiyat (₺)</span>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paket detayı, dahil olanlar…"
            required
            disabled={loading}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Geçerlilik tarihi</span>
          <input
            type="date"
            className={inputClass}
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            disabled={loading}
          />
        </label>
        {error ? (
          <div
            role="alert"
            className="whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Gönderiliyor…" : "Teklifi Gönder"}
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
