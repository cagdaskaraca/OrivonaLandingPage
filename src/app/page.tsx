import { Suspense } from "react";
import { HomeAiPlannerShowcase } from "@/src/components/home/HomeAiPlannerShowcase";
import { HomeContactSection } from "@/src/components/home/HomeContactSection";
import { HomeFooter } from "@/src/components/home/HomeFooter";
import { HomeHero } from "@/src/components/home/HomeHero";
import { HomeFaqSection } from "@/src/components/home/HomeFaqSection";
import { HomeHowItWorks } from "@/src/components/home/HomeHowItWorks";
import { HomeMarketplacePreview } from "@/src/components/home/HomeMarketplacePreview";
import { HomeNavbar } from "@/src/components/home/HomeNavbar";
import { HomeTrustSection } from "@/src/components/home/HomeTrustSection";
import { HomeVendorSection } from "@/src/components/home/HomeVendorSection";
import { MouseGlowLayer } from "@/src/components/landing/MouseGlowLayer";

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
      <MouseGlowLayer />

      <HomeNavbar />

      <main className="relative z-[2] pt-28 md:pt-24">
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
        <HomeFaqSection />
        <HomeVendorSection />
        <HomeContactSection />
      </main>

      <HomeFooter />
    </div>
  );
}
