"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { defaultInviteMessage } from "@/src/lib/invites";
import { btnPrimary, inputClass } from "@/src/lib/ui";

type SendInviteModalProps = {
  open: boolean;
  guestName: string;
  eventTitle: string;
  guestCount?: number;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
};

export function SendInviteModal({
  open,
  guestName,
  eventTitle,
  guestCount = 1,
  onClose,
  onSend,
}: SendInviteModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMessage(defaultInviteMessage(guestName, eventTitle));
      setError(null);
    }
  }, [open, guestName, eventTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSend(message.trim());
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Davetiye gönderilemedi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    guestCount > 1
      ? `${guestCount} davetliye kişiselleştirilmiş davetiye gönderilecek.`
      : undefined;

  return (
    <Modal open={open} title="Davetiye mesajı" onClose={onClose}>
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
            disabled={loading}
          />
        </label>
        <p className="text-xs text-zinc-500">
          E-posta sunucu tarafından gönderilir. Davet linki misafire iletilir.
        </p>
        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
        <button type="submit" className={btnPrimary} disabled={loading}>
          {loading ? "Gönderiliyor…" : "Davetiye gönder"}
        </button>
      </form>
    </Modal>
  );
}
