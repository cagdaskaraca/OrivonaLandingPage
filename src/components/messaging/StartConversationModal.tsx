"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { createConversation } from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { MarketplaceItem } from "@/src/lib/api/types";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

type StartConversationModalProps = {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (conversationId: string | number) => void;
};

export function StartConversationModal({
  item,
  open,
  onClose,
  onSuccess,
}: StartConversationModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const serviceId = item?.vendorServiceId ?? item?.id;
  const vendorId = item?.vendorId;
  const title = item?.serviceTitle ?? item?.title ?? "Hizmet";
  const vendor = item?.vendorName ?? "İşletme";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null) {
      setError("Hizmet kimliği bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const conversation = await createConversation({
        vendorServiceId: serviceId,
        vendorId: vendorId ?? undefined,
        message: message.trim() || undefined,
      });
      const id = conversation.id;
      setMessage("");
      onClose();
      if (id != null) {
        onSuccess?.(id);
        router.push(`/customer/dashboard?conversation=${encodeURIComponent(String(id))}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.log("Create conversation failed", err.body);
        setError(
          formatApiErrorMessage(err, err.message || "Mesaj gönderilemedi."),
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Mesaj gönderilemedi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title={`Mesaj Gönder — ${title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-zinc-400">
          <span className="text-violet-200/90">{vendor}</span> ile konuşma
          başlatın. İlk mesajınızı isteğe bağlı yazabilirsiniz.
        </p>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            İlk mesaj (isteğe bağlı)
          </span>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Merhaba, hizmetiniz hakkında bilgi almak istiyorum…"
            maxLength={2000}
          />
        </label>
        {error ? (
          <p className="whitespace-pre-line text-sm text-red-300">{error}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Gönderiliyor…" : "Mesaj Gönder"}
          </button>
          <button
            type="button"
            className={btnSecondary}
            disabled={loading}
            onClick={onClose}
          >
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
