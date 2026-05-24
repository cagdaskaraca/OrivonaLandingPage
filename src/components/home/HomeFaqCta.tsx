import Link from "next/link";
import { btnPrimary, glassCard } from "@/src/lib/ui";

export function HomeFaqCta() {
  return (
    <section
      id="sss"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className={`${glassCard} text-center`}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Yardım merkezi
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Merak ettiğiniz sorular mı var?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            ORIVONA&apos;nın müşteri, işletme, teklif, rezervasyon, AI planlayıcı ve
            QR davetiye süreçleri hakkında detaylı yanıtları inceleyin.
          </p>
          <Link href="/faq" className={`${btnPrimary} mt-8`}>
            Sıkça Sorulan Sorulara Git
          </Link>
          <p className="mt-4 text-xs text-zinc-500">
            Sağ alttaki OBot ile de anında soru sorabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}
