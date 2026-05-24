"use client";

import { useState } from "react";
import {
  confirmVendorCheckIn,
  verifyVendorCheckIn,
  type QrCheckInVerifyResult,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

export function QrCheckInSection() {
  const [ticketCode, setTicketCode] = useState("");
  const [qrText, setQrText] = useState("");
  const [verifyResult, setVerifyResult] = useState<QrCheckInVerifyResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleVerify() {
    if (!ticketCode.trim() && !qrText.trim()) {
      setError("Bilet kodu veya QR metni girin.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    setVerifyResult(null);
    try {
      const result = await verifyVendorCheckIn({
        ticketCode: ticketCode.trim() || undefined,
        qrText: qrText.trim() || undefined,
      });
      if (!result) {
        setUnavailable(true);
        return;
      }
      setVerifyResult(result);
      if (!result.valid) {
        setError("Bilet doğrulanamadı.");
      }
    } catch (err) {
      logApiError("QR verify", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Doğrulama başarısız."));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    try {
      await confirmVendorCheckIn({
        ticketCode: ticketCode.trim() || undefined,
        qrText: qrText.trim() || undefined,
        ticketId: verifyResult?.ticketId,
      });
      setSuccess("Giriş onaylandı.");
      setVerifyResult(null);
      setTicketCode("");
      setQrText("");
    } catch (err) {
      logApiError("QR confirm", err);
      setError(formatUiErrorMessage(err, "Giriş onaylanamadı."));
    } finally {
      setConfirming(false);
    }
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">QR check-in hazırlanıyor.</p>;
  }

  return (
    <div className={`${glassCard} space-y-4`}>
      <h3 className="text-sm font-semibold text-violet-200">QR Check-in</h3>
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">Bilet kodu</span>
        <input
          className={inputClass}
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="TKT-XXXX"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">QR metni (isteğe bağlı)</span>
        <textarea
          className={`${inputClass} min-h-[72px]`}
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="QR içeriğini yapıştırın"
        />
      </label>
      <button
        type="button"
        className={btnPrimary}
        disabled={loading}
        onClick={() => void handleVerify()}
      >
        {loading ? "Doğrulanıyor…" : "QR Doğrula"}
      </button>

      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-300/90">{success}</p>
      ) : null}

      {verifyResult?.valid ? (
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm">
          <p className="font-medium text-white">
            {verifyResult.guestName ?? "Misafir"}
          </p>
          <p className="mt-1 text-zinc-400">
            {verifyResult.eventTitle ?? "Etkinlik"}
          </p>
          {verifyResult.plusOneCount != null ? (
            <p className="mt-1 text-zinc-400">
              +{verifyResult.plusOneCount} misafir
            </p>
          ) : null}
          {verifyResult.alreadyCheckedIn ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
              Bu misafir zaten giriş yapmış.
            </p>
          ) : (
            <button
              type="button"
              className={`${btnSecondary} mt-4`}
              disabled={confirming}
              onClick={() => void handleConfirm()}
            >
              {confirming ? "Onaylanıyor…" : "Girişi Onayla"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
