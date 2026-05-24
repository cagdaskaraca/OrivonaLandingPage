"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingNavAuth } from "@/src/components/landing/LandingNavAuth";
import { SmoothScrollToSection, SmoothScrollToTop } from "@/src/components/SmoothLandingNav";

const navLink =
  "text-violet-100/90 transition-[color,text-shadow] duration-300 hover:text-white hover:drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]";

export function HomeNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <SmoothScrollToTop className="flex min-w-0 items-center transition-opacity hover:opacity-90">
          <span className="flex min-h-[3rem] shrink-0 items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-3 py-2">
            <Image
              src="/orivona-logo.png"
              alt="ORIVONA"
              width={320}
              height={96}
              priority
              className="h-10 w-auto max-h-10 object-contain object-left sm:h-11"
            />
          </span>
        </SmoothScrollToTop>

        <div className="hidden items-center gap-5 text-sm md:flex lg:gap-6">
          <Link href="/marketplace" className={navLink}>
            Marketplace
          </Link>
          <Link href="/ai-planner" className={navLink}>
            AI Planlayıcı
          </Link>
          <SmoothScrollToSection sectionId="isletmeler" className={navLink}>
            İşletmeler
          </SmoothScrollToSection>
          <SmoothScrollToSection sectionId="nasil-calisir" className={navLink}>
            Nasıl Çalışır
          </SmoothScrollToSection>
          <SmoothScrollToSection sectionId="sss" className={navLink}>
            SSS
          </SmoothScrollToSection>
          <SmoothScrollToSection sectionId="iletisim" className={navLink}>
            İletişim
          </SmoothScrollToSection>
        </div>

        <LandingNavAuth className="hidden sm:flex" />
      </nav>

      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3 text-xs font-medium text-zinc-400 md:hidden">
        <Link href="/marketplace" className="hover:text-violet-200">
          Marketplace
        </Link>
        <Link href="/ai-planner" className="hover:text-violet-200">
          AI Planlayıcı
        </Link>
        <SmoothScrollToSection sectionId="isletmeler" className="hover:text-violet-200">
          İşletmeler
        </SmoothScrollToSection>
        <SmoothScrollToSection sectionId="nasil-calisir" className="hover:text-violet-200">
          Nasıl Çalışır
        </SmoothScrollToSection>
        <SmoothScrollToSection sectionId="sss" className="hover:text-violet-200">
          SSS
        </SmoothScrollToSection>
        <SmoothScrollToSection sectionId="iletisim" className="hover:text-violet-200">
          İletişim
        </SmoothScrollToSection>
        <LandingNavAuth className="w-full justify-center border-t border-white/10 pt-3 sm:hidden" />
      </div>
    </header>
  );
}
