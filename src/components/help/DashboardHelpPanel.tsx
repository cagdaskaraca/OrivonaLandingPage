"use client";

import Link from "next/link";
import {
  CUSTOMER_HELP_CARDS,
  VENDOR_HELP_CARDS,
  type DashboardHelpCard,
} from "@/src/lib/helpContent";
import { btnSecondary, glassCard } from "@/src/lib/ui";
import { OnboardingHint } from "@/src/components/help/OnboardingHint";

type DashboardHelpPanelProps = {
  role: "customer" | "vendor";
};

function HelpCard({ card }: { card: DashboardHelpCard }) {
  function handleCta() {
    if (card.sectionId) {
      document.getElementById(card.sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  }

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
      ) : (
        <button
          type="button"
          className={`${btnSecondary} mt-4 text-xs`}
          onClick={handleCta}
        >
          {card.cta}
        </button>
      )}
    </div>
  );
}

export function DashboardHelpPanel({ role }: DashboardHelpPanelProps) {
  const cards = role === "customer" ? CUSTOMER_HELP_CARDS : VENDOR_HELP_CARDS;

  return (
    <section id="dashboard-help" className="scroll-mt-24 mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Başlarken</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {role === "customer"
            ? "Organizasyon planınız, teklif ve rezervasyon süreçleri için önerilen adımlar."
            : "Hizmet ilanı, müsaitlik ve teklif akışı için önerilen adımlar (hizmet sağlayıcı işletme)."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <HelpCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
