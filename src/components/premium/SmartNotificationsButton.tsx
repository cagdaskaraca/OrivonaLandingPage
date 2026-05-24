"use client";

import { useState } from "react";
import { generateSmartNotifications } from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnSecondary } from "@/src/lib/ui";

type SmartNotificationsButtonProps = {
  onGenerated?: () => void;
};

export function SmartNotificationsButton({
  onGenerated,
}: SmartNotificationsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setMessage(null);
    try {
      const count = await generateSmartNotifications();
      setMessage(`${count} akıllı bildirim oluşturuldu.`);
      onGenerated?.();
    } catch (err) {
      logApiError("Smart notifications", err);
      if (isApiNotFound(err)) {
        setHidden(true);
      } else {
        setMessage(formatUiErrorMessage(err, "Bildirimler oluşturulamadı."));
      }
    } finally {
      setLoading(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="mb-4">
      <button
        type="button"
        className={`${btnSecondary} text-xs`}
        disabled={loading}
        onClick={() => void handleGenerate()}
      >
        {loading ? "Oluşturuluyor…" : "Akıllı bildirimleri oluştur"}
      </button>
      {message ? (
        <p className="mt-2 text-xs text-violet-200/90">{message}</p>
      ) : null}
    </div>
  );
}
