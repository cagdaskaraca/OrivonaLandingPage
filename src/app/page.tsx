import type { ReactNode } from "react";
import Image from "next/image";

function OrivonaLogo({
  variant = "nav",
  className = "",
}: {
  variant?: "nav" | "footer" | "hero";
  className?: string;
}) {
  const sizeClass =
    variant === "nav"
      ? "h-8 w-auto max-h-8 max-w-[9.5rem] sm:h-9 sm:max-h-9 sm:max-w-[10.5rem]"
      : variant === "footer"
        ? "h-7 w-auto max-h-7 max-w-[8.5rem]"
        : "h-10 w-auto max-h-10 max-w-[11rem] sm:h-11 sm:max-h-11 sm:max-w-[12rem]";

  return (
    <Image
      src="/orivona-logo.png"
      alt="Orivona"
      width={320}
      height={96}
      priority={variant === "nav"}
      className={`object-contain object-left ${sizeClass} ${className}`.trim()}
    />
  );
}

const trustItems = [
  {
    title: "Doğrulanmış işletmeler",
    body: "Profil ve belge kontrolleriyle güvenilir ortaklar.",
  },
  {
    title: "Güvenli rezervasyon",
    body: "Şeffaf koşullar ve güvenli ödeme altyapısı.",
  },
  {
    title: "Gerçek müşteri yorumları",
    body: "Karar vermeden önce deneyimleri inceleyin.",
  },
  {
    title: "Teklif ve planlama sistemi",
    body: "Teklifleri karşılaştırın, takvimi tek yerde yönetin.",
  },
] as const;

const features = [
  {
    title: "AI Organizasyon Asistanı",
    desc: "Akıllı öneriler ve hazır şablonlarla planlamayı hızlandırın.",
    icon: (
      <path
        d="M12 18a6 6 0 1 0 12 0c0-3-2-5-3-7-1 2-3 4-3 7m-6 4v2m6-2v2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Güvenli ödeme altyapısı",
    desc: "PCI uyumlu altyapı ve şeffaf komisyon yapısı.",
    icon: (
      <path
        d="M8 12h16v10H8V12zm4-4h8a4 4 0 0 1 4 4v0H8v0a4 4 0 0 1 4-4z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Lokasyon bazlı hizmet keşfi",
    desc: "Şehrinize ve etkinlik türüne göre en iyi eşleşmeler.",
    icon: (
      <>
        <path
          d="M12 11c0 3 4 7 4 7s4-4 4-7a4 4 0 1 0-8 0z"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    title: "İşletme paneli",
    desc: "Teklifler, rezervasyonlar ve mesajlar tek ekranda.",
    icon: (
      <path
        d="M10 8h12v4H10V8zM8 16h16v8H8v-8zm4-8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Gerçek teslimat fotoğrafları",
    desc: "Portföy ve etkinlik sonrası görüntülerle güven oluşturun.",
    icon: (
      <>
        <rect
          x="7"
          y="9"
          width="18"
          height="14"
          rx="2"
          strokeWidth="1.6"
        />
        <path
          d="M7 20l5-5 4 4 5-6 6 7"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    title: "Organizasyon checklist’i",
    desc: "Görevleri paylaşın, tarihleri takip edin, kaçırmayın.",
    icon: (
      <path
        d="M9 11l3 3L21 9M9 17h6M9 21h10"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
] as const;

const steps = [
  "Organizasyon türünü seç",
  "Hizmet sağlayıcıları keşfet",
  "Teklif al veya rezervasyon yap",
  "Süreci tek panelden yönet",
] as const;

const categories = [
  "Düğün",
  "Nişan",
  "Kına",
  "Doğum Günü",
  "Baby Shower",
  "Kurumsal Etkinlik",
  "DJ",
  "Fotoğrafçı",
  "Çiçekçi",
  "Pasta",
  "Catering",
  "Nakliye",
  "Garson",
  "Ses Sistemi",
  "Düğün Arabası",
] as const;

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-9 w-9 text-violet-300/90"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const MAIL_INFO = "mailto:info@orivona.com";
const MAIL_PARTNERS = "mailto:partners@orivona.com";
const MAIL_PARTNERS_BUSINESS =
  "mailto:partners@orivona.com?subject=" +
  encodeURIComponent("Orivona İşletme Başvurusu");
const MAIL_PARTNERS_EARLY =
  "mailto:partners@orivona.com?subject=" +
  encodeURIComponent("Orivona Erken Partner Başvurusu");

const glassCard =
  "rounded-2xl border border-violet-200/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_12px_48px_-18px_rgba(24,12,48,0.75)] backdrop-blur-xl";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06040c] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_20%,rgba(192,132,252,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-20 h-[540px] w-[min(92vw,58rem)] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-400/22 via-purple-600/12 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[10%] left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-900/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-violet-200/[0.06] bg-[#06040c]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
          <a
            href="#"
            className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="flex shrink-0 items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <OrivonaLogo variant="nav" />
            </span>
            <span className="hidden text-xs font-semibold tracking-[0.22em] text-zinc-200 sm:inline">
              ORIVONA
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a
              href="#ozellikler"
              className="transition-colors hover:text-white"
            >
              Özellikler
            </a>
            <a
              href="#nasil-calisir"
              className="transition-colors hover:text-white"
            >
              Nasıl Çalışır
            </a>
            <a
              href="#isletmeler"
              className="transition-colors hover:text-white"
            >
              İşletmeler
            </a>
            <a
              href="#iletisim"
              className="transition-colors hover:text-white"
            >
              İletişim
            </a>
          </div>

          <a
            href="#erken-erisim"
            className="shrink-0 rounded-full bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 px-3.5 py-2 text-xs font-semibold text-[#0a0612] shadow-[0_8px_28px_-6px_rgba(167,139,250,0.55)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-6px_rgba(192,132,252,0.55)] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Erken Erişim
          </a>
        </nav>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-5 gap-y-2 border-t border-violet-200/[0.05] px-4 py-3 text-xs font-medium text-zinc-400 md:hidden">
          <a href="#ozellikler" className="hover:text-violet-200">
            Özellikler
          </a>
          <a href="#nasil-calisir" className="hover:text-violet-200">
            Nasıl Çalışır
          </a>
          <a href="#isletmeler" className="hover:text-violet-200">
            İşletmeler
          </a>
          <a href="#iletisim" className="hover:text-violet-200">
            İletişim
          </a>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4 rounded-2xl border border-violet-200/10 bg-white/[0.03] px-5 py-3 shadow-[0_8px_32px_-12px_rgba(88,28,135,0.45)] backdrop-blur-md">
                <OrivonaLogo variant="hero" />
                <div className="hidden h-10 w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent sm:block" />
                <div className="hidden text-left sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-200/80">
                    Orivona
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-400">
                    AI destekli organizasyon deneyimi
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/[0.12] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100/95 sm:text-xs">
              Yakında · Erken erişim
            </p>
            <h1 className="bg-gradient-to-b from-white via-violet-50 to-zinc-500 bg-clip-text text-4xl font-semibold leading-[1.12] tracking-tight text-transparent sm:text-5xl md:text-6xl md:leading-[1.08]">
              Organizasyonlarını tek platformdan planla, rezerve et ve güvenle
              yönet.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Düğün, nişan, doğum günü ve kurumsal etkinlikler için doğrulanmış
              hizmet sağlayıcıları keşfet. Teklif al, rezervasyon yap ve tüm
              süreci Orivona ile kolayca yönet.
            </p>
            <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <a
                href="#erken-erisim"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0a0612] shadow-[0_14px_44px_-12px_rgba(255,255,255,0.28)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_52px_-12px_rgba(237,233,254,0.35)]"
              >
                Erken Erişime Katıl
              </a>
              <a
                href={MAIL_PARTNERS_BUSINESS}
                className="inline-flex items-center justify-center rounded-full border border-violet-300/25 bg-violet-500/10 px-7 py-3.5 text-sm font-semibold text-violet-50 backdrop-blur-sm transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-violet-500/18"
              >
                İşletme Başvurusu Yap
              </a>
              <a
                href={MAIL_INFO}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 sm:pb-28">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className={`${glassCard} text-left transition-transform hover:-translate-y-0.5`}
              >
                <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-400 shadow-[0_0_16px_rgba(167,139,250,0.45)]" />
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="ozellikler"
          className="relative border-t border-violet-200/[0.06] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Öne çıkan yetenekler
              </h2>
              <p className="mt-4 text-zinc-400">
                Etkinlik planlamasından teslimata kadar uçtan uca deneyim.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`${glassCard} flex flex-col gap-4 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-violet-300/25 hover:shadow-[0_16px_48px_-16px_rgba(109,40,217,0.35)]`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <FeatureIcon>{f.icon}</FeatureIcon>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="nasil-calisir"
          className="relative py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Nasıl çalışır?
              </h2>
              <p className="mt-4 text-zinc-400">
                Dört adımda organizasyonunuzu netleştirin.
              </p>
            </div>
            <div className="relative mx-auto mt-14 max-w-5xl">
              <div
                className="pointer-events-none absolute left-[6%] right-[6%] top-[22px] z-0 hidden h-px bg-gradient-to-r from-violet-500/35 via-fuchsia-500/25 to-violet-500/35 md:block"
                aria-hidden
              />
              <ol className="relative z-10 grid gap-8 md:grid-cols-4 md:gap-6">
                {steps.map((label, i) => (
                  <li key={label} className="relative flex gap-4 md:block">
                    <div className="flex shrink-0 flex-col items-center md:mb-6 md:flex-row md:justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/35 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-sm font-semibold text-violet-100 shadow-[0_0_24px_-4px_rgba(167,139,250,0.5)]">
                        {i + 1}
                      </span>
                    </div>
                    <div className={`${glassCard} flex-1 md:text-center`}>
                      <p className="text-sm font-medium leading-snug text-white md:text-base">
                        {label}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="relative border-t border-violet-200/[0.06] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Kategoriler
              </h2>
              <p className="mt-4 text-zinc-400">
                Etkinlik türü ve hizmet segmentine göre keşfedin.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-white"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="isletmeler"
          className="relative py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div
              className={`${glassCard} relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16`}
            >
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/25 to-fuchsia-600/10 blur-3xl"
                aria-hidden
              />
              <div className="relative max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                  İşletmeler için
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  İşletmenizi Orivona’da görünür hale getirin.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
                  Organizasyon firmaları, DJ’ler, fotoğrafçılar, çiçekçiler,
                  pastacılar, catering firmaları, nakliye ekipleri ve mekanlar
                  erken partner olarak başvurarak Orivona üzerinden yeni
                  müşterilere ulaşabilir, teklif verebilir ve rezervasyonlarını
                  yönetebilir.
                </p>
                <a
                  href={MAIL_PARTNERS_EARLY}
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 px-8 py-3.5 text-sm font-semibold text-[#0a0612] shadow-[0_12px_36px_-8px_rgba(167,139,250,0.5)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-8px_rgba(192,132,252,0.55)]"
                >
                  Erken Partner Başvurusu
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="erken-erisim"
          className="relative border-t border-violet-200/[0.06] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
                Öncelikli erken erişim
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Erken erişim listesi
              </h2>
              <p className="mt-4 text-zinc-400">
                Lansman, özel davetler ve ürün güncellemelerinden ilk siz
                haberdar olun.
              </p>
            </div>
            <div
              className={`${glassCard} mx-auto mt-12 max-w-2xl border-violet-200/[0.1] p-6 sm:p-8`}
            >
              <form className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-name"
                      className="mb-2 block text-left text-sm font-medium text-zinc-300"
                    >
                      Ad Soyad
                    </label>
                    <input
                      id="lead-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Adınız ve soyadınız"
                      className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-400/45 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lead-email"
                      className="mb-2 block text-left text-sm font-medium text-zinc-300"
                    >
                      E-posta adresi
                    </label>
                    <input
                      id="lead-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ornek@email.com"
                      className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-400/45 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lead-phone"
                      className="mb-2 block text-left text-sm font-medium text-zinc-300"
                    >
                      Telefon
                    </label>
                    <input
                      id="lead-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+90 5xx xxx xx xx"
                      className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-400/45 focus:ring-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-city"
                      className="mb-2 block text-left text-sm font-medium text-zinc-300"
                    >
                      Şehir
                    </label>
                    <input
                      id="lead-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Örn. İstanbul"
                      className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-400/45 focus:ring-2"
                    />
                  </div>
                </div>
                <fieldset>
                  <legend className="mb-2 block text-left text-sm font-medium text-zinc-300">
                    Sizi en iyi tanımlayan seçenek
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="organizer"
                        defaultChecked
                        className="peer sr-only"
                      />
                      <span className="flex min-h-[3rem] items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-sm font-medium text-zinc-400 transition-all peer-checked:border-violet-400/50 peer-checked:bg-violet-500/15 peer-checked:text-violet-100 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50">
                        Organizasyon planlıyorum
                      </span>
                    </label>
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="business"
                        className="peer sr-only"
                      />
                      <span className="flex min-h-[3rem] items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-sm font-medium text-zinc-400 transition-all peer-checked:border-violet-400/50 peer-checked:bg-violet-500/15 peer-checked:text-violet-100 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50">
                        İşletmeyim
                      </span>
                    </label>
                  </div>
                </fieldset>
                <button
                  type="button"
                  className="w-full rounded-full bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 py-3.5 text-sm font-semibold text-[#0a0612] shadow-[0_12px_40px_-8px_rgba(167,139,250,0.5)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-8px_rgba(216,180,254,0.45)]"
                >
                  Listeye Katıl
                </button>
                <p className="rounded-xl border border-amber-200/10 bg-amber-500/[0.06] px-4 py-3 text-center text-xs leading-relaxed text-amber-100/85">
                  Form gönderimi yakında aktif olacak. Şimdilik{" "}
                  <a
                    href={MAIL_INFO}
                    className="font-semibold text-amber-50 underline-offset-2 hover:underline"
                  >
                    info@orivona.com
                  </a>{" "}
                  üzerinden bize ulaşabilirsiniz.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section
          id="iletisim"
          className="relative border-t border-violet-200/[0.06] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                İletişim
              </h2>
              <p className="mt-4 text-zinc-400">
                Sorularınız ve iş birliği talepleriniz için doğrudan e-posta ile
                bize ulaşın.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
              <a
                href={MAIL_INFO}
                className={`${glassCard} group block transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
                  Genel iletişim
                </p>
                <p className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
                  info@orivona.com
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Ürün, destek ve genel sorularınız için tıklayarak e-posta
                  gönderebilirsiniz.
                </p>
              </a>
              <a
                href={MAIL_PARTNERS}
                className={`${glassCard} group block transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
                  İş ortaklığı
                </p>
                <p className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
                  partners@orivona.com
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  İşletme ve partner başvuruları için tıklayarak e-posta
                  gönderebilirsiniz.
                </p>
              </a>
            </div>
            <div className="mx-auto mt-10 max-w-3xl text-center">
              <a
                href={MAIL_INFO}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative mt-auto border-t border-violet-200/[0.06] bg-black/25 py-14 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-flex w-fit items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-2.5 py-1.5">
                <OrivonaLogo variant="footer" />
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-300 sm:pt-1">
                ORIVONA
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Etkinliklerinizi planlamaktan rezervasyona kadar tek, güvenilir ve
              AI destekli platform.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bağlantılar</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <li>
                <a href="#ozellikler" className="hover:text-violet-200">
                  Özellikler
                </a>
              </li>
              <li>
                <a href="#nasil-calisir" className="hover:text-violet-200">
                  Nasıl Çalışır
                </a>
              </li>
              <li>
                <a href="#isletmeler" className="hover:text-violet-200">
                  İşletmeler
                </a>
              </li>
              <li>
                <a href="#erken-erisim" className="hover:text-violet-200">
                  Erken Erişim
                </a>
              </li>
              <li>
                <a href="#iletisim" className="hover:text-violet-200">
                  İletişim
                </a>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold text-white">E-posta</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={MAIL_INFO}
                  className="block font-medium text-violet-200 underline-offset-4 hover:text-white hover:underline"
                >
                  info@orivona.com
                </a>
              </li>
              <li>
                <a
                  href={MAIL_PARTNERS}
                  className="block font-medium text-violet-200 underline-offset-4 hover:text-white hover:underline"
                >
                  partners@orivona.com
                </a>
                <span className="mt-1 block text-xs text-zinc-600">
                  İş ortaklığı ve işletme başvuruları
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-violet-200/[0.06] px-4 pt-8 text-center text-xs text-zinc-600 sm:px-6 sm:text-left">
          © 2026 Orivona. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
