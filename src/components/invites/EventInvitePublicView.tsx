"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { QrTicketDisplay } from "@/src/components/invites/QrTicketDisplay";
import {
  fetchEventInviteByToken,
  fetchEventInviteTicket,
  submitEventInviteRsvp,
  verifyEventInviteGuest,
} from "@/src/lib/api/publicEventInvite";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type {
  EventInviteInfo,
  InviteTicket,
  VerifyGuestResult,
} from "@/src/lib/api/types";
import {
  clearGuestAccessToken,
  getGuestAccessToken,
  storeGuestAccessToken,
} from "@/src/lib/eventInviteAccess";
import { formatEventLocation } from "@/src/lib/invites";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

type EventInvitePublicViewProps = {
  token: string;
};

type Phase =
  | "loading"
  | "inactive"
  | "verify"
  | "ambiguous"
  | "no_match"
  | "rsvp"
  | "accepted"
  | "declined"
  | "maybe"
  | "error";

export function EventInvitePublicView({ token }: EventInvitePublicViewProps) {
  const [event, setEvent] = useState<EventInviteInfo | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [guest, setGuest] = useState<VerifyGuestResult | null>(null);
  const [ticket, setTicket] = useState<InviteTicket | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plusOneCount, setPlusOneCount] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingAccept, setPendingAccept] = useState(false);

  const accessToken = guest?.guestAccessToken ?? getGuestAccessToken(token);

  const loadEvent = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const data = await fetchEventInviteByToken(token);
      setEvent(data);
      if (data.isActive === false) {
        setPhase("inactive");
        return;
      }
      setPhase("verify");
    } catch (err) {
      logApiError("Event invite load", err);
      setError(formatUiErrorMessage(err, "Davetiye yüklenemedi."));
      setPhase("error");
    }
  }, [token]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyEventInviteGuest(token, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (
        result.multipleMatches ||
        result.requiresEmail ||
        result.requiresPhone
      ) {
        setGuest(result);
        setPhase("ambiguous");
        return;
      }

      if (result.matched === false || !result.guestAccessToken) {
        setPhase("no_match");
        return;
      }

      storeGuestAccessToken(token, result.guestAccessToken);
      setGuest(result);

      const status = normalizeRsvp(result.rsvpStatus);
      if (result.alreadyResponded && status === "Accepted") {
        setPhase("accepted");
        try {
          setTicket(
            await fetchEventInviteTicket(token, result.guestAccessToken),
          );
        } catch {
          setTicket(null);
        }
      } else if (result.alreadyResponded && status === "Declined") {
        setPhase("declined");
      } else if (result.alreadyResponded && status === "Maybe") {
        setPhase("maybe");
      } else {
        setPhase("rsvp");
      }
    } catch (err) {
      logApiError("Verify guest", err);
      setVerifyError(
        formatUiErrorMessage(err, "Doğrulama yapılamadı."),
      );
    } finally {
      setVerifying(false);
    }
  }

  function normalizeRsvp(status?: string): string {
    const s = status?.trim().toLowerCase() ?? "";
    if (s === "accepted" || s === "attending" || s === "yes") return "Accepted";
    if (s === "declined" || s === "notattending" || s === "no") return "Declined";
    if (s === "maybe" || s === "uncertain") return "Maybe";
    return "Pending";
  }

  async function submitRsvp(status: "Accepted" | "Declined" | "Maybe") {
    const guestToken = accessToken;
    if (!guestToken) {
      setVerifyError("Oturum süresi doldu. Lütfen tekrar doğrulayın.");
      setPhase("verify");
      clearGuestAccessToken(token);
      return;
    }

    if (status === "Accepted") {
      setPendingAccept(true);
      return;
    }

    setSubmitting(true);
    setVerifyError(null);
    try {
      await submitEventInviteRsvp(token, {
        guestAccessToken: guestToken,
        rsvpStatus: status,
        plusOneCount: 0,
        note: note.trim() || undefined,
      });
      if (status === "Declined") setPhase("declined");
      else setPhase("maybe");
    } catch (err) {
      logApiError("Event RSVP", err);
      setVerifyError(formatUiErrorMessage(err, "Yanıt kaydedilemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmAccepted() {
    const guestToken = accessToken;
    if (!guestToken) return;
    setSubmitting(true);
    setVerifyError(null);
    try {
      await submitEventInviteRsvp(token, {
        guestAccessToken: guestToken,
        rsvpStatus: "Accepted",
        plusOneCount,
        note: note.trim() || undefined,
      });
      setPendingAccept(false);
      setPhase("accepted");
      try {
        setTicket(await fetchEventInviteTicket(token, guestToken));
      } catch {
        setTicket(null);
      }
    } catch (err) {
      logApiError("Event RSVP accepted", err);
      setVerifyError(formatUiErrorMessage(err, "Yanıt kaydedilemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  const location = event ? formatEventLocation(event) : "";
  const welcome =
    event?.welcomeMessage?.trim() ?? event?.message?.trim() ?? "";
  const plusOneAllowed = event?.plusOneAllowed !== false;
  const maxPlus = event?.maxPlusOne ?? 5;
  const displayName =
    guest?.maskedName ?? guest?.guestName ?? "Misafir";

  return (
    <div className="min-h-screen bg-[#06040c] px-4 py-8 sm:py-12">
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
              onClick={() => void loadEvent()}
            >
              Tekrar dene
            </button>
          </div>
        ) : null}

        {phase === "inactive" ? (
          <div className={`${glassCard} text-center`}>
            <p className="text-sm text-zinc-300">
              Bu davet linki artık aktif değil.
            </p>
          </div>
        ) : null}

        {event && phase !== "loading" && phase !== "error" && phase !== "inactive" ? (
          <div
            className={`${glassCard} mb-6 overflow-hidden border-violet-400/25 p-0`}
          >
            <div className="bg-gradient-to-br from-violet-600/30 via-fuchsia-600/15 to-transparent px-6 py-8 text-center">
              <p className="text-xs uppercase tracking-widest text-violet-200/80">
                {event.eventType ?? "Özel etkinlik"}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {event.eventTitle ?? "Davetlisiniz"}
              </h1>
            </div>
            <div className="space-y-3 px-6 py-5 text-center text-sm text-zinc-400">
              {event.hostName ? (
                <p>
                  Ev sahibi:{" "}
                  <span className="text-zinc-200">{event.hostName}</span>
                </p>
              ) : null}
              {event.eventDate ? (
                <p>
                  {event.eventDate.slice(0, 10)}
                  {location ? ` · ${location}` : ""}
                </p>
              ) : location ? (
                <p>{location}</p>
              ) : null}
              {welcome ? (
                <blockquote className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-3 text-left text-sm italic leading-relaxed text-zinc-300">
                  {welcome}
                </blockquote>
              ) : null}
            </div>
          </div>
        ) : null}

        {(phase === "verify" || phase === "ambiguous") && !pendingAccept ? (
          <div className={`${glassCard} space-y-4`}>
            <h2 className="text-center text-lg font-semibold text-white">
              Davetli doğrulama
            </h2>
            {phase === "ambiguous" ? (
              <p className="text-center text-sm text-amber-200/90">
                Birden fazla eşleşme bulundu. Lütfen telefon ve e-posta bilgilerinizi
                girin.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                Ad soyadınızı ve iletişim bilgilerinizi girin.
              </p>
            )}
            <form onSubmit={handleVerify} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-400">Ad Soyad</span>
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={verifying}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-400">Telefon</span>
                <input
                  className={inputClass}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={phase === "ambiguous" || guest?.requiresPhone === true}
                  disabled={verifying}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-400">
                  E-posta (isteğe bağlı)
                </span>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={guest?.requiresEmail === true}
                  disabled={verifying}
                />
              </label>
              {verifyError ? (
                <p className="text-sm text-red-300/90">{verifyError}</p>
              ) : null}
              <button type="submit" className={`${btnPrimary} w-full`} disabled={verifying}>
                {verifying ? "Doğrulanıyor…" : "Doğrula"}
              </button>
            </form>
          </div>
        ) : null}

        {phase === "no_match" ? (
          <div className={`${glassCard} border-amber-400/25 text-center`}>
            <p className="text-sm text-amber-100">
              Davetli listesinde eşleşme bulunamadı. Bilgilerinizi kontrol ediniz.
            </p>
            <button
              type="button"
              className={`${btnSecondary} mt-4`}
              onClick={() => {
                setPhase("verify");
                setVerifyError(null);
              }}
            >
              Tekrar dene
            </button>
          </div>
        ) : null}

        {(phase === "rsvp" || pendingAccept) && guest ? (
          <div className="space-y-4">
            <div className={`${glassCard} text-center`}>
              <p className="text-xs text-zinc-500">Hoş geldiniz</p>
              <p className="mt-1 text-lg font-semibold text-white">{displayName}</p>
            </div>

            {!pendingAccept ? (
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
                  className={`${btnSecondary} w-full border-red-400/25 text-red-100`}
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
                <p className="text-sm font-medium text-violet-100">Katılım detayları</p>
                {plusOneAllowed ? (
                  <label className="block text-sm">
                    <span className="mb-1 block text-xs text-zinc-400">
                      Yanınızda getireceğiniz kişi (+1)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={maxPlus}
                      className={inputClass}
                      value={plusOneCount}
                      onChange={(e) =>
                        setPlusOneCount(
                          Math.min(maxPlus, Math.max(0, Number(e.target.value))),
                        )
                      }
                    />
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-zinc-400">Not</span>
                  <input
                    className={inputClass}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                {verifyError ? (
                  <p className="text-sm text-red-300/90">{verifyError}</p>
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
                  onClick={() => setPendingAccept(false)}
                >
                  Geri
                </button>
              </div>
            )}
          </div>
        ) : null}

        {phase === "accepted" ? (
          <div className="space-y-4">
            <div className={`${glassCard} border-emerald-400/25 bg-emerald-500/10 text-center`}>
              <p className="text-sm text-emerald-100">
                Katılımınız onaylandı. Giriş için QR biletiniz aşağıdadır.
              </p>
            </div>
            {ticket ? (
              <QrTicketDisplay ticket={ticket} />
            ) : (
              <p className="text-center text-xs text-zinc-500">Bilet hazırlanıyor…</p>
            )}
            <p className="text-center text-xs text-zinc-500">
              Ekran görüntüsü alabilir veya bileti kaydedebilirsiniz.
            </p>
          </div>
        ) : null}

        {phase === "declined" ? (
          <div className={`${glassCard} text-center`}>
            <p className="text-zinc-200">Katılım durumunuz alınmıştır.</p>
            <p className="mt-2 text-sm text-zinc-500">Anlayışınız için teşekkür ederiz.</p>
          </div>
        ) : null}

        {phase === "maybe" ? (
          <div className={`${glassCard} border-amber-400/25 bg-amber-500/10 text-center`}>
            <p className="text-amber-100">
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
