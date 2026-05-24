"use client";

import Link from "next/link";
import { Suspense } from "react";
import { LandingNavAuth } from "@/src/components/landing/LandingNavAuth";
import { OrivonaHeaderLogo } from "@/src/components/nav/OrivonaHeaderLogo";
import { GlobalSearch } from "@/src/components/premium/GlobalSearch";
import { SmoothScrollToSection, SmoothScrollToTop } from "@/src/components/SmoothLandingNav";
import {
  orivonaHeaderActions,
  orivonaHeaderInner,
  orivonaHeaderShellFixed,
  orivonaHeaderShellRelative,
  orivonaNavLink,
  orivonaNavLinkMobile,
} from "@/src/lib/orivonaHeader";

type OrivonaSiteHeaderProps = {
  /** Full marketing links (home, FAQ). */
  variant?: "marketing" | "app";
  /** Fixed to viewport top (dashboard) vs in document flow. */
  fixed?: boolean;
  /** Dashboard global search in the 88px bar. */
  showSearch?: boolean;
};

function AppNavLinks({ className }: { className?: string }) {
  return (
    <div className={`hidden items-center gap-5 md:flex lg:gap-6 ${className ?? ""}`}>
      <Link href="/marketplace" className={orivonaNavLink}>
        Marketplace
      </Link>
      <Link href="/ai-planner" className={orivonaNavLink}>
        AI Planlayıcı
      </Link>
    </div>
  );
}

function MarketingNavLinks({ className }: { className?: string }) {
  return (
    <div className={`hidden items-center gap-5 md:flex lg:gap-6 ${className ?? ""}`}>
      <Link href="/marketplace" className={orivonaNavLink}>
        Marketplace
      </Link>
      <Link href="/ai-planner" className={orivonaNavLink}>
        AI Planlayıcı
      </Link>
      <SmoothScrollToSection sectionId="isletmeler" className={orivonaNavLink}>
        İşletmeler
      </SmoothScrollToSection>
      <SmoothScrollToSection sectionId="nasil-calisir" className={orivonaNavLink}>
        Nasıl Çalışır
      </SmoothScrollToSection>
      <Link href="/faq" className={orivonaNavLink}>
        SSS
      </Link>
      <SmoothScrollToSection sectionId="iletisim" className={orivonaNavLink}>
        İletişim
      </SmoothScrollToSection>
    </div>
  );
}

export function OrivonaSiteHeader({
  variant = "app",
  fixed = true,
  showSearch = false,
}: OrivonaSiteHeaderProps) {
  const shellClass = fixed ? orivonaHeaderShellFixed : orivonaHeaderShellRelative;

  return (
    <header className={shellClass}>
      <div className={orivonaHeaderInner}>
        {variant === "marketing" ? (
          <OrivonaHeaderLogo
            priority
            wrapper={({ className, children }) => (
              <SmoothScrollToTop className={className}>{children}</SmoothScrollToTop>
            )}
          />
        ) : (
          <OrivonaHeaderLogo href="/" />
        )}

        {showSearch ? (
          <div className="flex min-h-0 min-w-0 flex-1 items-center sm:max-w-md lg:mx-2">
            <Suspense fallback={null}>
              <GlobalSearch compact />
            </Suspense>
          </div>
        ) : null}

        {variant === "marketing" ? <MarketingNavLinks /> : <AppNavLinks />}

        <LandingNavAuth className={`${orivonaHeaderActions} hidden sm:flex`} />
      </div>

      {variant === "marketing" ? (
        <div className="orivona-header-mobile-row mx-auto flex max-w-6xl flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-2.5 md:hidden">
          <Link href="/marketplace" className={orivonaNavLinkMobile}>
            Marketplace
          </Link>
          <Link href="/ai-planner" className={orivonaNavLinkMobile}>
            AI Planlayıcı
          </Link>
          <SmoothScrollToSection sectionId="isletmeler" className={orivonaNavLinkMobile}>
            İşletmeler
          </SmoothScrollToSection>
          <SmoothScrollToSection sectionId="nasil-calisir" className={orivonaNavLinkMobile}>
            Nasıl Çalışır
          </SmoothScrollToSection>
          <Link href="/faq" className={orivonaNavLinkMobile}>
            SSS
          </Link>
          <SmoothScrollToSection sectionId="iletisim" className={orivonaNavLinkMobile}>
            İletişim
          </SmoothScrollToSection>
          <LandingNavAuth className="w-full justify-center border-t border-white/10 pt-2.5 sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}
