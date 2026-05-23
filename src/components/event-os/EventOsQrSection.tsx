"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import { fetchQrInvite } from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { QrInvite } from "@/src/lib/api/types";
import { btnPrimary } from "@/src/lib/ui";

function QrPanel({ planId }: { planId: string | number }) {
  const [invite, setInvite] = useState<QrInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvite(await fetchQrInvite(planId));
    } catch (err) {
      logApiError("QR invite", err);
      setInvite(null);
      setError(formatUiErrorMessage(err, "QR davetiye yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyLink() {
    const url = invite?.inviteUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Bağlantı kopyalanamadı.");
    }
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">QR davetiye yükleniyor…</p>
      ) : !invite?.inviteUrl && !invite?.demoText ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Davetiye bağlantısı henüz oluşturulmamış.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
              Davet bağlantısı
            </p>
            <p className="mt-2 break-all text-sm text-zinc-300">
              {invite.inviteUrl ?? "—"}
            </p>
            {invite.inviteUrl ? (
              <button
                type="button"
                className={`${btnPrimary} mt-4`}
                onClick={() => void copyLink()}
              >
                {copied ? "Kopyalandı ✓" : "Davet linkini kopyala"}
              </button>
            ) : null}
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-violet-400/30 bg-[#0a0612]/80 px-6 py-8 text-center">
            {invite.qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invite.qrCodeUrl}
                alt="QR davetiye"
                className="mx-auto mb-4 h-40 w-40 rounded-lg border border-white/10"
              />
            ) : (
              <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10">
                <span className="text-4xl text-violet-300/50" aria-hidden>
                  ▦
                </span>
              </div>
            )}
            <p className="text-sm font-medium text-violet-100">QR Davetiye</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              {invite.demoText ??
                invite.message ??
                "Misafirleriniz bu QR kodu tarayarak RSVP verebilir. (Demo)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function EventOsQrSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <QrPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
