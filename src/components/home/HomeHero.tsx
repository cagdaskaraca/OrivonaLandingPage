import Link from "next/link";

const heroCta =
  "inline-flex h-11 w-full items-center justify-center rounded-full border border-violet-300/25 bg-gradient-to-b from-white/[0.06] via-violet-500/10 to-violet-950/40 px-5 text-sm font-semibold text-violet-50 shadow-[0_8px_28px_-14px_rgba(88,28,135,0.38)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-violet-300/38 hover:shadow-[0_12px_36px_-12px_rgba(109,40,217,0.45)] sm:h-12 sm:w-auto sm:px-6";

const heroCtaPrimary = `${heroCta} border-violet-300/35 from-violet-500/14 to-violet-800/35 shadow-[0_10px_32px_-12px_rgba(109,40,217,0.44)]`;

export function HomeHero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pb-14">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-violet-300/25 bg-violet-500/[0.12] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-100/95 sm:text-xs">
          AI destekli organizasyon platformu
        </p>
        <h1 className="bg-gradient-to-b from-white via-violet-50 to-zinc-400 bg-clip-text text-3xl font-semibold leading-[1.12] tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Organizasyonunu planla, hizmet sağlayıcılarını keşfet ve tüm süreci tek
          yerden yönet.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Düğün, nişan, doğum günü ve kurumsal etkinlikler için doğrulanmış hizmet
          sağlayıcılarını keşfet, teklif al ve organizasyonunu kolayca yönet.
        </p>
        <div className="mx-auto mt-10 flex w-full max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link href="/marketplace" className={heroCtaPrimary}>
            Marketplace&apos;i Keşfet
          </Link>
          <Link href="/ai-planner" className={heroCta}>
            AI Planlayıcıyı Dene
          </Link>
          <Link href="/register?type=vendor" className={heroCta}>
            İşletme Başvurusu Yap
          </Link>
        </div>
      </div>
    </section>
  );
}
