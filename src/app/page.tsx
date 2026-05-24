import { Suspense } from "react";
import { HomeAiPlannerShowcase } from "@/src/components/home/HomeAiPlannerShowcase";
import { HomeContactSection } from "@/src/components/home/HomeContactSection";
import { HomeFooter } from "@/src/components/home/HomeFooter";
import { HomeHero } from "@/src/components/home/HomeHero";
import { HomeFaqCta } from "@/src/components/home/HomeFaqCta";
import { HomeHowItWorks } from "@/src/components/home/HomeHowItWorks";
import { HomeMarketplacePreview } from "@/src/components/home/HomeMarketplacePreview";
import { HomeNavbar } from "@/src/components/home/HomeNavbar";
import { HomeTrustSection } from "@/src/components/home/HomeTrustSection";
import { HomeVendorSection } from "@/src/components/home/HomeVendorSection";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <HomeNavbar />

      <main className="orivona-landing-main relative z-[2]">
        <HomeHero />
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[22rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
                  />
                ))}
              </div>
            </div>
          }
        >
          <HomeMarketplacePreview />
        </Suspense>
        <HomeHowItWorks />
        <HomeTrustSection />
        <HomeAiPlannerShowcase />
        <HomeFaqCta />
        <HomeVendorSection />
        <HomeContactSection />
      </main>

      <HomeFooter />
    </div>
  );
}
