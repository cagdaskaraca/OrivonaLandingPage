"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { createOfferRequest } from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { MarketplaceItem } from "@/src/lib/api/types";
import { btnPrimary, inputClass } from "@/src/lib/ui";

type OfferRequestModalProps = {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function OfferRequestModal({
  item,
  open,
  onClose,
  onSuccess,
}: OfferRequestModalProps) {
  const [message, setMessage] = useState("");
  const [guestCount, setGuestCount] = useState("100");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceId =
    item?.vendorServiceId ?? item?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null) return;
    setLoading(true);
    setError(null);
    try {
      await createOfferRequest({
        vendorServiceId: serviceId,
        message: message.trim(),
        guestCount: Number(guestCount),
        eventDate: eventDate || undefined,
      });
      setMessage("");
      setEventDate("");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) console.log("Offer request failed", err.body);
      setError(formatApiErrorMessage(err, "Teklif isteği gönderilemedi."));
    } finally {
      setLoading(false);
    }
  }

  const title = item?.serviceTitle ?? item?.title ?? "Hizmet";

  return (
    <Modal open={open} title={`Teklif İste — ${title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Mesajınız</span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Misafir sayısı</span>
          <input
            type="number"
            className={inputClass}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            min={1}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Etkinlik tarihi (opsiyonel)
          </span>
          <input
            type="date"
            className={inputClass}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
          {loading ? "Gönderiliyor…" : "Teklif İste"}
        </button>
      </form>
    </Modal>
  );
}
