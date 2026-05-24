import Link from "next/link";
import { FaqPageGroupedSection } from "@/src/components/help/FaqPageGroupedSection";
import { HomeFooter } from "@/src/components/home/HomeFooter";
import { HomeNavbar } from "@/src/components/home/HomeNavbar";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

export function FaqPageView() {
  return (
    <div className="relative min-h-screen">
      <HomeNavbar />

      <main className="orivona-landing-main relative z-[2]">
        <section className="border-b border-violet-200/[0.06] py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
              Yardım merkezi
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Sıkça Sorulan Sorular
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Müşteri, işletme ve organizasyon süreçleri hakkında detaylı rehber.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className={btnSecondary}>
                Ana sayfaya dön
              </Link>
              <Link href="/marketplace" className={btnSecondary}>
                Marketplace&apos;i keşfet
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <FaqPageGroupedSection />
          </div>
        </section>

        <section className="border-t border-violet-200/[0.06] py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className={`${glassCard} text-center`}>
              <h2 className="text-lg font-semibold text-white">
                Hazır mısınız?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">
                Planlamaya başlayın veya işletmenizi ORIVONA&apos;da listeleyin.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/" className={btnSecondary}>
                  Ana sayfaya dön
                </Link>
                <Link href="/marketplace" className={btnSecondary}>
                  Marketplace&apos;i keşfet
                </Link>
                <Link href="/ai-planner" className={btnPrimary}>
                  AI Planlayıcıyı dene
                </Link>
                <Link href="/register?type=vendor" className={btnSecondary}>
                  İşletme başvurusu yap
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
