"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { createOfferRequest } from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { MarketplaceItem } from "@/src/lib/api/types";
import { btnPrimary, inputClass } from "@/src/lib/ui";

const SUCCESS_MESSAGE = "Teklif talebiniz gönderildi.";

type OfferRequestModalProps = {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
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

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const serviceId = item?.vendorServiceId ?? item?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null) {
      setError("Hizmet kimliği bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createOfferRequest({
        vendorServiceId: serviceId,
        message: message.trim(),
        guestCount: Number(guestCount),
        eventDate: eventDate.trim(),
      });
      setMessage("");
      setGuestCount("100");
      setEventDate("");
      onSuccess(SUCCESS_MESSAGE);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        console.log("Offer request failed", err.body);
        setError(
          formatApiErrorMessage(err, err.message || "Teklif talebi gönderilemedi."),
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Teklif talebi gönderilemedi.");
      }
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
            placeholder="Etkinliğiniz ve beklentileriniz hakkında kısa bilgi…"
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
          <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik tarihi</span>
          <input
            type="date"
            className={inputClass}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
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
        <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
          {loading ? "Gönderiliyor…" : "Teklif Gönder"}
        </button>
      </form>
    </Modal>
  );
}

export { SUCCESS_MESSAGE as OFFER_REQUEST_SUCCESS_MESSAGE };
