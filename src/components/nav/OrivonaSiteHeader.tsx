"use client";

import Link from "next/link";
import { Suspense } from "react";
import { LandingNavAuth } from "@/src/components/landing/LandingNavAuth";
import { OrivonaHeaderLogo } from "@/src/components/nav/OrivonaHeaderLogo";
import { GlobalSearch } from "@/src/components/premium/GlobalSearch";
import { SmoothScrollToSection, SmoothScrollToTop } from "@/src/components/SmoothLandingNav";
import {
  orivonaHeaderActions,
  orivonaHeaderCenter,
  orivonaHeaderEnd,
  orivonaHeaderInner,
  orivonaHeaderShellFixed,
  orivonaHeaderShellRelative,
  orivonaHeaderStart,
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

function AppNavLinks() {
  return (
    <>
      <Link href="/marketplace" className={orivonaNavLink}>
        Marketplace
      </Link>
      <Link href="/ai-planner" className={orivonaNavLink}>
        AI Planlayıcı
      </Link>
    </>
  );
}

function MarketingNavLinks() {
  return (
    <>
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
    </>
  );
}

function HeaderCenter({
  variant,
  showSearch,
}: {
  variant: "marketing" | "app";
  showSearch: boolean;
}) {
  if (showSearch) {
    return (
      <div className={`${orivonaHeaderCenter} px-2`}>
        <div className="w-full min-w-[12rem] max-w-md">
          <Suspense fallback={null}>
            <GlobalSearch compact />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <nav
      className={orivonaHeaderCenter}
      aria-label="Ana menü"
    >
      {variant === "marketing" ? <MarketingNavLinks /> : <AppNavLinks />}
    </nav>
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
        <div className={orivonaHeaderStart}>
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
        </div>

        <HeaderCenter variant={variant} showSearch={showSearch} />

        <div className={`${orivonaHeaderEnd} col-start-2 md:col-start-3`}>
          <LandingNavAuth className={`${orivonaHeaderActions} flex`} />
        </div>
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
        </div>
      ) : null}
    </header>
  );
}
