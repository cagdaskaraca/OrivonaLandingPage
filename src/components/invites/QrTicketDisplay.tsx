"use client";

import { useEffect, useState } from "react";
import type { InviteTicket } from "@/src/lib/api/types";
import { glassCard } from "@/src/lib/ui";

type QrTicketDisplayProps = {
  ticket: InviteTicket;
  className?: string;
};

export function QrTicketDisplay({ ticket, className = "" }: QrTicketDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const qrPayload =
    ticket.qrText?.trim() ||
    ticket.ticketCode?.trim() ||
    ticket.qrCodeUrl?.trim() ||
    "";

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (ticket.qrCodeUrl || ticket.qrImageUrl) {
        setQrDataUrl(ticket.qrCodeUrl ?? ticket.qrImageUrl ?? null);
        return;
      }
      if (!qrPayload) {
        setQrDataUrl(null);
        return;
      }
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(qrPayload, {
          width: 240,
          margin: 2,
          color: { dark: "#1a0a2e", light: "#f5f3ff" },
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [qrPayload, ticket.qrCodeUrl, ticket.qrImageUrl]);

  return (
    <div
      className={`${glassCard} border-violet-400/30 bg-gradient-to-b from-violet-500/15 to-[#08050f]/90 text-center ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/80">
        Giriş bileti
      </p>
      <h3 className="mt-2 text-lg font-bold text-white">
        {ticket.eventTitle ?? "Etkinlik"}
      </h3>
      <p className="mt-1 text-sm text-zinc-400">{ticket.guestName}</p>
      {ticket.plusOneCount != null && ticket.plusOneCount > 0 ? (
        <p className="mt-1 text-xs text-violet-300/80">
          +{ticket.plusOneCount} misafir
        </p>
      ) : null}

      <div className="mx-auto mt-6 flex h-[260px] w-[260px] max-w-full items-center justify-center rounded-2xl border border-white/15 bg-white p-3 shadow-[0_0_40px_rgba(139,92,246,0.25)]">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR giriş bileti"
            className="h-full w-full object-contain"
          />
        ) : qrPayload ? (
          <p className="break-all px-2 font-mono text-xs text-violet-950">
            {qrPayload}
          </p>
        ) : (
          <p className="text-xs text-zinc-500">QR yükleniyor…</p>
        )}
      </div>

      {ticket.ticketCode ? (
        <p className="mt-4 font-mono text-sm tracking-wider text-violet-200">
          {ticket.ticketCode}
        </p>
      ) : null}
    </div>
  );
}
