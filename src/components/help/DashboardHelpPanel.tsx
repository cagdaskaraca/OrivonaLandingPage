"use client";

import Link from "next/link";
import { scrollToHashWhenReady } from "@/src/lib/scrollToDashboardSection";
import { VENDOR_HELP_CARDS, type DashboardHelpCard } from "@/src/lib/helpContent";
import { btnSecondary, glassCard } from "@/src/lib/ui";
import { OnboardingHint } from "@/src/components/help/OnboardingHint";

type DashboardHelpPanelProps = {
  role: "customer" | "vendor";
};

const CUSTOMER_ROADMAP = [
  {
    id: "customer-roadmap-1",
    step: "1. Plan",
    title: "Etkinlik planını oluştur",
    description:
      "Önce etkinlik planınızı oluşturun ve aktif planı seçin. Checklist ve davetiye bu plana göre çalışır.",
    cta: "Planlara git",
    sectionId: "event-os-plans",
  },
  {
    id: "customer-roadmap-2",
    step: "2. Teklif",
    title: "Tedarikçi tekliflerini yönet",
    description:
      "Marketplace'ten tedarikçi bulun, teklif isteyin ve gelen teklifleri yönetip kabul edin.",
    cta: "Tekliflere git",
    sectionId: "dashboard-offers",
  },
  {
    id: "customer-roadmap-3",
    step: "3. Davetli",
    title: "Davetlilerini ekle",
    description:
      "Davetli listesini oluşturun, RSVP durumlarını takip edin ve paylaşıma hazır hale getirin.",
    cta: "Davetlilere git",
    sectionId: "event-os-guests",
  },
  {
    id: "customer-roadmap-4",
    step: "4. Masa",
    title: "Masa planını hazırla",
    description:
      "Masa düzeninizi kurun ve davetlileri masalara yerleştirerek hızlı bir plan çıkarın.",
    cta: "Masa planına git",
    sectionId: "event-os-seating",
  },
  {
    id: "customer-roadmap-5",
    step: "5. Davetiye",
    title: "Davetiye tasarla",
    description:
      "Davetiye Stüdyosu ile şablon, metin, görsel ve QR kodlu davetiye hazırlayın.",
    cta: "Davetiye tasarla",
    sectionId: "event-os-invitation-design",
  },
  {
    id: "customer-roadmap-6",
    step: "6. Paylaş",
    title: "Ortak davet linkini paylaş",
    description:
      "Ortak davet linki ile davetliler kendilerini doğrular ve RSVP süreci otomatikleşir.",
    cta: "Davet linkine git",
    sectionId: "event-os-public-invite",
  },
] as const;

function scrollToSection(sectionId: string) {
  scrollToHashWhenReady(`#${sectionId}`, {
    highlight: true,
    forceSameHash: true,
    updateHash: true,
  });
}

function HelpCard({ card }: { card: DashboardHelpCard }) {
  return (
    <div className={`${glassCard} flex flex-col`}>
      <h3 className="text-sm font-semibold text-white">{card.title}</h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
        {card.description}
      </p>
      {card.hint ? (
        <OnboardingHint id={`help-${card.id}`} className="mt-3">
          {card.hint}
        </OnboardingHint>
      ) : null}
      {card.href ? (
        <Link href={card.href} className={`${btnSecondary} mt-4 text-center text-xs`}>
          {card.cta}
        </Link>
      ) : card.sectionId ? (
        <button
          type="button"
          className={`${btnSecondary} mt-4 text-xs`}
          onClick={() => scrollToSection(card.sectionId!)}
        >
          {card.cta}
        </button>
      ) : null}
    </div>
  );
}

function CustomerRoadmapCard({
  card,
}: {
  card: (typeof CUSTOMER_ROADMAP)[number];
}) {
  return (
    <div className={`${glassCard} flex h-full flex-col`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200/70">
        {card.step}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-white">{card.title}</h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
        {card.description}
      </p>
      <button
        type="button"
        className={`${btnSecondary} mt-4 text-xs`}
        onClick={() => scrollToSection(card.sectionId)}
      >
        {card.cta}
      </button>
    </div>
  );
}

export function DashboardHelpPanel({ role }: DashboardHelpPanelProps) {
  return (
    <section id="dashboard-help" className="scroll-mt-24 mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Başlarken</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {role === "customer"
            ? "Sırayla ilerleyebileceğiniz kısa bir yol haritası."
            : "Hizmet ilanı, müsaitlik ve teklif akışı için önerilen adımlar (hizmet sağlayıcı işletme)."}
        </p>
      </div>
      {role === "customer" ? (
        <>
          <div className="orivona-scroll-x -mx-2 px-2 lg:hidden">
            <div className="flex min-w-max gap-4">
              {CUSTOMER_ROADMAP.map((card) => (
                <div key={card.id} className="w-[16rem] flex-none">
                  <CustomerRoadmapCard card={card} />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden gap-4 lg:grid lg:grid-cols-3 lg:items-stretch xl:grid-cols-6">
            {CUSTOMER_ROADMAP.map((card) => (
              <CustomerRoadmapCard key={card.id} card={card} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VENDOR_HELP_CARDS.map((card) => (
            <HelpCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}
