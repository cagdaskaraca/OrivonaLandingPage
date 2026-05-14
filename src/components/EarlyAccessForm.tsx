"use client";

import { useCallback, useRef, useState } from "react";

const FORMSPREE_URL = "https://formspree.io/f/xqenjwae";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-400/45 focus:ring-2";

const toggleBase =
  "flex min-h-[3rem] w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50";

const toggleInactive =
  "border-white/10 bg-black/30 text-zinc-400 hover:border-white/15 hover:bg-black/40";

const toggleActive =
  "border-violet-400/50 bg-violet-500/15 text-violet-100 shadow-[0_0_20px_-8px_rgba(139,92,246,0.35)]";

type UserType = "organizer" | "business";

type FormStatus = "idle" | "sending" | "success" | "error";

export function EarlyAccessForm({ className }: { className: string }) {
  const [userType, setUserType] = useState<UserType>("organizer");
  const [status, setStatus] = useState<FormStatus>("idle");
  const submitting = useRef(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting.current) return;
      submitting.current = true;

      const form = e.currentTarget;
      setStatus("sending");

      const formData = new FormData(form);
      formData.set("userType", userType);

      try {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });

        if (res.ok) {
          setStatus("success");
          form.reset();
          setUserType("organizer");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      } finally {
        submitting.current = false;
      }
    },
    [userType],
  );

  return (
    <div className={className}>
      {status === "success" && (
        <div
          className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/[0.12] via-violet-950/40 to-black/60 p-8 text-center shadow-[0_0_48px_-12px_rgba(52,211,153,0.35)] backdrop-blur-xl"
          role="status"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(167,250,200,0.12),transparent_55%)]" />
          <div className="relative mx-auto flex max-w-md flex-col items-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full border-2 border-emerald-400/50 motion-safe:animate-[orivona-success-ring_1.4s_ease-out_infinite]"
                aria-hidden
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_28px_rgba(52,211,153,0.55)]">
                <svg
                  className="h-7 w-7 motion-safe:animate-[orivona-pop-in_0.5s_ease-out_both]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-5 text-base font-semibold text-white">
              Başvurunuz alındı
            </p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
              ORIVONA erken erişim listesine eklendiniz. Davet ve güncellemeler
              için geliştirmeleri takip edin.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-xs font-semibold text-zinc-200 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/[0.1]"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-xs font-semibold text-zinc-200 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/[0.1]"
              >
                LinkedIn
              </a>
            </div>
            <p className="mt-4 text-[11px] text-zinc-500">
              Resmi hesaplar lansman ile güncellenecektir.
            </p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div
          className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-center text-sm leading-relaxed text-red-100/95"
          role="alert"
        >
          Bir sorun oluştu. Lütfen tekrar deneyin veya{" "}
          <a
            href="mailto:info@orivona.com"
            className="font-semibold text-red-50 underline-offset-2 hover:underline"
          >
            info@orivona.com
          </a>{" "}
          üzerinden bize ulaşın.
        </div>
      )}

      <form className="space-y-5" method="POST" onSubmit={handleSubmit}>
        <input type="hidden" name="userType" value={userType} readOnly />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="early-fullName"
              className="mb-2 block text-left text-sm font-medium text-zinc-300"
            >
              Ad Soyad
            </label>
            <input
              id="early-fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Adınız ve soyadınız"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="early-email"
              className="mb-2 block text-left text-sm font-medium text-zinc-300"
            >
              E-posta adresi
            </label>
            <input
              id="early-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@email.com"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="early-phone"
              className="mb-2 block text-left text-sm font-medium text-zinc-300"
            >
              Telefon
            </label>
            <input
              id="early-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+90 5xx xxx xx xx"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="early-city"
              className="mb-2 block text-left text-sm font-medium text-zinc-300"
            >
              Şehir
            </label>
            <input
              id="early-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="Örn. İstanbul"
              className={inputClass}
            />
          </div>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2 block w-full text-left text-sm font-medium text-zinc-300">
            Sizi en iyi tanımlayan seçenek
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={userType === "organizer"}
              onClick={() => {
                setUserType("organizer");
                if (status === "success" || status === "error")
                  setStatus("idle");
              }}
              className={`${toggleBase} ${
                userType === "organizer" ? toggleActive : toggleInactive
              }`}
            >
              Organizasyon planlıyorum
            </button>
            <button
              type="button"
              aria-pressed={userType === "business"}
              onClick={() => {
                setUserType("business");
                if (status === "success" || status === "error")
                  setStatus("idle");
              }}
              className={`${toggleBase} ${
                userType === "business" ? toggleActive : toggleInactive
              }`}
            >
              İşletmeyim
            </button>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 py-3.5 text-sm font-semibold text-[#0a0612] shadow-[0_12px_40px_-8px_rgba(167,139,250,0.5)] transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-8px_rgba(216,180,254,0.45)] disabled:pointer-events-none disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {status === "sending" ? "Gönderiliyor..." : "Listeye Katıl"}
        </button>
      </form>
    </div>
  );
}
