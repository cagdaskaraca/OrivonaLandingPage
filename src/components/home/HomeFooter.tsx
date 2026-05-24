import Image from "next/image";
import Link from "next/link";
import { SmoothScrollToSection, SmoothScrollToTop } from "@/src/components/SmoothLandingNav";

const MAIL_INFO = "mailto:info@orivona.com";
const MAIL_PARTNERS = "mailto:partners@orivona.com";

export function HomeFooter() {
  return (
    <footer className="relative z-[2] mt-auto border-t border-violet-200/[0.06] bg-black/25 py-14 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <SmoothScrollToTop className="inline-flex items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-2.5 py-1.5">
            <Image
              src="/orivona-logo.png"
              alt="ORIVONA"
              width={320}
              height={96}
              className="h-8 w-auto max-h-8 object-contain object-left"
            />
          </SmoothScrollToTop>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            AI destekli etkinlik marketplace&apos;i — planlayın, keşfedin, teklif
            alın ve organizasyonunuzu tek yerden yönetin.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Bağlantılar</p>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li>
              <Link href="/marketplace" className="hover:text-violet-200">
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/ai-planner" className="hover:text-violet-200">
                AI Planlayıcı
              </Link>
            </li>
            <li>
              <SmoothScrollToSection sectionId="nasil-calisir" className="hover:text-violet-200">
                Nasıl Çalışır
              </SmoothScrollToSection>
            </li>
            <li>
              <SmoothScrollToSection sectionId="sss" className="hover:text-violet-200">
                SSS
              </SmoothScrollToSection>
            </li>
            <li>
              <SmoothScrollToSection sectionId="isletmeler" className="hover:text-violet-200">
                İşletmeler
              </SmoothScrollToSection>
            </li>
            <li>
              <SmoothScrollToSection sectionId="iletisim" className="hover:text-violet-200">
                İletişim
              </SmoothScrollToSection>
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
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-violet-200/[0.06] px-4 pt-8 text-center text-xs text-zinc-600 sm:px-6 sm:text-left">
        © 2026 ORIVONA. All rights reserved.
      </div>
    </footer>
  );
}
