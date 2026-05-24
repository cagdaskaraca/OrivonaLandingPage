"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { QrTicketDisplay } from "@/src/components/invites/QrTicketDisplay";
import {
  fetchInviteByToken,
  fetchInviteTicket,
  submitInviteRsvp,
} from "@/src/lib/api/invites";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { InviteDetails, InviteTicket } from "@/src/lib/api/types";
import { formatEventLocation } from "@/src/lib/invites";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

type InvitePublicViewProps = {
  token: string;
};

type ViewPhase =
  | "loading"
  | "form"
  | "accepted"
  | "declined"
  | "maybe"
  | "error";

export function InvitePublicView({ token }: InvitePublicViewProps) {
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [ticket, setTicket] = useState<InviteTicket | null>(null);
  const [phase, setPhase] = useState<ViewPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [plusOneCount, setPlusOneCount] = useState(0);
  const [note, setNote] = useState("");
  const [pendingStatus, setPendingStatus] = useState<
    "Accepted" | "Declined" | "Maybe" | null
  >(null);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const data = await fetchInviteByToken(token);
      setInvite(data);
      const responded =
        data.alreadyResponded === true ||
        data.hasResponded === true ||
        normalizeRsvp(data.rsvpStatus) !== "Pending";
      if (responded) {
        const status = normalizeRsvp(data.rsvpStatus);
        if (status === "Accepted") {
          setPhase("accepted");
          try {
            setTicket(await fetchInviteTicket(token));
          } catch {
            setTicket(null);
          }
        } else if (status === "Declined") {
          setPhase("declined");
        } else if (status === "Maybe") {
          setPhase("maybe");
        } else {
          setPhase("form");
        }
      } else {
        setPhase("form");
      }
    } catch (err) {
      logApiError("Invite load", err);
      setError(formatUiErrorMessage(err, "Davetiye yüklenemedi."));
      setPhase("error");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function normalizeRsvp(status?: string): string {
    const s = status?.trim().toLowerCase() ?? "";
    if (s === "accepted" || s === "attending" || s === "yes") return "Accepted";
    if (s === "declined" || s === "notattending" || s === "no") return "Declined";
    if (s === "maybe" || s === "uncertain") return "Maybe";
    return "Pending";
  }

  async function submitRsvp(status: "Accepted" | "Declined" | "Maybe") {
    if (status === "Accepted") {
      setPendingStatus("Accepted");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitInviteRsvp(token, {
        rsvpStatus: status,
        plusOneCount: 0,
        note: note.trim() || undefined,
      });
      if (status === "Declined") setPhase("declined");
      else setPhase("maybe");
    } catch (err) {
      logApiError("Invite RSVP", err);
      setError(formatUiErrorMessage(err, "Yanıtınız kaydedilemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmAccepted() {
    setSubmitting(true);
    setError(null);
    try {
      await submitInviteRsvp(token, {
        rsvpStatus: "Accepted",
        plusOneCount,
        note: note.trim() || undefined,
      });
      setPhase("accepted");
      setPendingStatus(null);
      try {
        setTicket(await fetchInviteTicket(token));
      } catch {
        setTicket(null);
      }
    } catch (err) {
      logApiError("Invite RSVP accepted", err);
      setError(formatUiErrorMessage(err, "Yanıtınız kaydedilemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  const location = invite ? formatEventLocation(invite) : "";
  const message = invite?.customMessage ?? invite?.message;
  const plusOneAllowed = invite?.plusOneAllowed !== false;
  const maxPlus = invite?.maxPlusOne ?? 5;

  return (
    <div className="min-h-screen bg-[#06040c] px-4 py-10 sm:py-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.22),transparent)]" />

      <div className="relative mx-auto max-w-lg">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.35em] text-violet-400/80">
          ORIVONA
        </p>

        {phase === "loading" ? (
          <div className={`${glassCard} text-center`}>
            <p className="text-sm text-violet-200">Davetiye yükleniyor…</p>
          </div>
        ) : null}

        {phase === "error" ? (
          <div className={`${glassCard} border-red-500/30 text-center`}>
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              className={`${btnSecondary} mt-4`}
              onClick={() => void load()}
            >
              Tekrar dene
            </button>
          </div>
        ) : null}

        {(phase === "form" || pendingStatus === "Accepted") && invite ? (
          <>
            <div
              className={`${glassCard} mb-6 overflow-hidden border-violet-400/25 p-0`}
            >
              <div className="bg-gradient-to-br from-violet-600/30 via-fuchsia-600/15 to-transparent px-6 py-8 text-center">
                <p className="text-xs uppercase tracking-widest text-violet-200/80">
                  Davetlisiniz
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {invite.eventTitle ?? "Özel etkinlik"}
                </h1>
              </div>
              <div className="space-y-4 px-6 py-6">
                <p className="text-center text-lg text-violet-100/95">
                  Sayın{" "}
                  <span className="font-semibold text-white">
                    {invite.guestName ?? "Misafir"}
                  </span>
                </p>
                {invite.hostName ? (
                  <p className="text-center text-sm text-zinc-400">
                    Ev sahibi:{" "}
                    <span className="text-zinc-200">{invite.hostName}</span>
                  </p>
                ) : null}
                {invite.eventDate ? (
                  <p className="text-center text-sm text-zinc-400">
                    {invite.eventDate.slice(0, 10)}
                    {location ? ` · ${location}` : ""}
                  </p>
                ) : location ? (
                  <p className="text-center text-sm text-zinc-400">{location}</p>
                ) : null}
                {message?.trim() ? (
                  <blockquote className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-3 text-sm italic leading-relaxed text-zinc-300">
                    {message}
                  </blockquote>
                ) : null}
              </div>
            </div>

            {pendingStatus !== "Accepted" ? (
              <div className="space-y-3">
                <button
                  type="button"
                  className={`${btnPrimary} w-full`}
                  disabled={submitting}
                  onClick={() => void submitRsvp("Accepted")}
                >
                  Katılım sağlayacağım
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} w-full border-red-400/25 text-red-100 hover:bg-red-500/10`}
                  disabled={submitting}
                  onClick={() => void submitRsvp("Declined")}
                >
                  Katılamayacağım
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} w-full`}
                  disabled={submitting}
                  onClick={() => void submitRsvp("Maybe")}
                >
                  Kararsızım
                </button>
              </div>
            ) : (
              <div className={`${glassCard} space-y-4`}>
                <p className="text-sm font-medium text-violet-100">
                  Katılım detayları
                </p>
                {plusOneAllowed ? (
                  <label className="block text-sm">
                    <span className="mb-1 block text-xs text-zinc-400">
                      Yanınızda getireceğiniz kişi sayısı (+1)
                    </span>
                    <NumericInput
                      min={0}
                      max={maxPlus}
                      value={plusOneCount}
                      onChange={(n) =>
                        setPlusOneCount(Math.min(maxPlus, Math.max(0, n)))
                      }
                    />
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-zinc-400">
                    Not (isteğe bağlı)
                  </span>
                  <input
                    className={inputClass}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Örn. Diyet tercihi…"
                  />
                </label>
                {error ? (
                  <p className="text-sm text-red-300/90">{error}</p>
                ) : null}
                <button
                  type="button"
                  className={`${btnPrimary} w-full`}
                  disabled={submitting}
                  onClick={() => void confirmAccepted()}
                >
                  {submitting ? "Kaydediliyor…" : "Katılımı onayla"}
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} w-full text-xs`}
                  onClick={() => setPendingStatus(null)}
                >
                  Geri
                </button>
              </div>
            )}
          </>
        ) : null}

        {phase === "accepted" ? (
          <div className="space-y-6">
            <div className={`${glassCard} border-emerald-400/25 bg-emerald-500/10 text-center`}>
              <p className="text-sm font-medium text-emerald-100">
                Katılımınız onaylandı. QR giriş biletiniz e-posta adresinize
                gönderilecektir.
              </p>
            </div>
            {ticket ? (
              <QrTicketDisplay ticket={ticket} />
            ) : (
              <p className="text-center text-xs text-zinc-500">
                Bilet bilgisi hazırlanıyor…
              </p>
            )}
          </div>
        ) : null}

        {phase === "declined" ? (
          <div className={`${glassCard} border-zinc-500/30 text-center`}>
            <p className="text-base text-zinc-200">
              Katılım durumunuz alınmıştır.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Anlayışınız için teşekkür ederiz.
            </p>
          </div>
        ) : null}

        {phase === "maybe" ? (
          <div className={`${glassCard} border-amber-400/25 bg-amber-500/10 text-center`}>
            <p className="text-base text-amber-100">
              Kararsız yanıtınız kaydedildi. Daha sonra tekrar ziyaret edebilirsiniz.
            </p>
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/" className="text-violet-400/80 hover:text-violet-300">
            ORIVONA ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
