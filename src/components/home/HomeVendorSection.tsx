import Image from "next/image";
import Link from "next/link";
import { glassCard, btnPrimary } from "@/src/lib/ui";

export function HomeVendorSection() {
  return (
    <section
      id="isletmeler"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div
            className={`${glassCard} relative order-2 overflow-hidden px-6 py-12 sm:px-10 sm:py-14 lg:order-1`}
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/25 to-fuchsia-600/10 blur-3xl"
              aria-hidden
            />
            <div className="relative max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                İşletmeler için
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                İşletmenizi ORIVONA marketplace&apos;inde listeleyin
              </h2>
              <p className="mt-5 text-base leading-relaxed text-zinc-400">
                Mekanlar, catering, fotoğrafçılar, DJ&apos;ler ve daha fazlası —
                doğrulanmış profille yeni müşterilere ulaşın, teklif verin ve
                rezervasyonlarınızı tek panelden yönetin.
              </p>
              <Link href="/register?type=vendor" className={`${btnPrimary} mt-8`}>
                İşletme Başvurusu Yap
              </Link>
            </div>
          </div>
          <div
            className={`${glassCard} relative order-1 overflow-hidden border-violet-200/12 p-2 sm:p-3 lg:order-2`}
          >
            <Image
              src="/business-partners.png"
              alt="ORIVONA iş ortakları ve işletme ağı"
              width={1600}
              height={1000}
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="relative h-auto w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
