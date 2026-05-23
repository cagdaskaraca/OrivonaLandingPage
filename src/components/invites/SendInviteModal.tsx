"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { defaultInviteMessage } from "@/src/lib/invites";
import type { SendInviteResult } from "@/src/lib/api/types";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

type SendInviteModalProps = {
  open: boolean;
  guestName: string;
  eventTitle: string;
  guestCount?: number;
  onClose: () => void;
  onSend: (message: string) => Promise<SendInviteResult>;
  onSuccess?: (result: SendInviteResult) => void;
};

export function SendInviteModal({
  open,
  guestName,
  eventTitle,
  guestCount = 1,
  onClose,
  onSend,
  onSuccess,
}: SendInviteModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSending(false);
      setError(null);
      return;
    }
    setMessage(defaultInviteMessage(guestName, eventTitle));
    setError(null);
    setSending(false);
  }, [open, guestName, eventTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await onSend(message.trim());
      onSuccess?.(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Davetiye gönderilemedi.",
      );
    } finally {
      setSending(false);
    }
  }

  const subtitle =
    guestCount > 1
      ? `${guestCount} davetliye kişiselleştirilmiş davetiye gönderilecek.`
      : undefined;

  return (
    <Modal open={open} title="Davetiye mesajı" onClose={sending ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {subtitle ? (
          <p className="text-sm text-zinc-400">{subtitle}</p>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Mesaj</span>
          <textarea
            className={`${inputClass} min-h-[140px] resize-y leading-relaxed`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={sending}
          />
        </label>
        <p className="text-xs text-zinc-500">
          E-posta sunucu tarafından gönderilir. Davet linki misafire iletilir.
        </p>
        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary} disabled={sending}>
            {sending ? "Gönderiliyor…" : "Davetiye gönder"}
          </button>
          <button
            type="button"
            className={btnSecondary}
            disabled={sending}
            onClick={onClose}
          >
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
