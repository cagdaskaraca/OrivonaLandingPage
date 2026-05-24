"use client";

import { useRef, useState } from "react";
import { AiBudgetOptimizerPanel } from "@/src/components/ai-planner/AiBudgetOptimizerPanel";
import {
  AiIntelligenceError,
  AiIntelligenceLoading,
} from "@/src/components/ai-planner/AiIntelligenceStates";
import { AiMissingServicesPanel } from "@/src/components/ai-planner/AiMissingServicesPanel";
import { AiMoodboardPanel } from "@/src/components/ai-planner/AiMoodboardPanel";
import { AiPlannerResults } from "@/src/components/ai-planner/AiPlannerResults";
import { AiPlannerTabs } from "@/src/components/ai-planner/AiPlannerTabs";
import { AiSimilarEventsPanel } from "@/src/components/ai-planner/AiSimilarEventsPanel";
import { AiStyleMatchPanel } from "@/src/components/ai-planner/AiStyleMatchPanel";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  OFFER_REQUEST_SUCCESS_MESSAGE,
  OfferRequestModal,
} from "@/src/components/marketplace/OfferRequestModal";
import { StartConversationModal } from "@/src/components/messaging/StartConversationModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { useToast } from "@/src/contexts/ToastContext";
import { fetchAiEventPlan } from "@/src/lib/api";
import {
  fetchAiBudgetOptimizer,
  fetchAiMissingServices,
  fetchAiMoodboard,
  fetchAiSimilarEvents,
  fetchAiStyleMatch,
} from "@/src/lib/api/aiIntelligence";
import type {
  AiBudgetOptimizerResult,
  AiEventPlanResult,
  AiMissingServicesResult,
  AiMoodboardResult,
  AiRecommendationItem,
  AiSimilarEventsResult,
  AiStyleMatchResult,
  MarketplaceItem,
} from "@/src/lib/api/types";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import { recommendationToMarketplaceItem } from "@/src/lib/aiPlanner";
import {
  type AiPlannerTabId,
  submitLabelForTab,
} from "@/src/lib/aiIntelligenceUi";
import { SavedAiPlansPanel } from "@/src/components/premium/SavedAiPlansPanel";
import { VendorMatchSection } from "@/src/components/premium/VendorMatchSection";
import { btnPrimary, glassCard } from "@/src/lib/ui";

const PROMPT_PLACEHOLDER =
  "Nasıl bir etkinlik planlıyorsunuz? Örn: İstanbul Beşiktaş'ta klasik tarzda 250 kişilik düğün yapmak istiyorum. Bütçem 800.000 TL.";

const EXAMPLE_PROMPT =
  "İstanbul Beşiktaş'ta klasik tarzda 250 kişilik düğün yapmak istiyorum. Bütçem 800.000 TL.";

export function AiPlannerView() {
  const toast = useToast();
  const { isAuthenticated, role } = useAuth();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<AiPlannerTabId>("plan");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<AiEventPlanResult | null>(null);
  const [moodboard, setMoodboard] = useState<AiMoodboardResult | null>(null);
  const [budgetOpt, setBudgetOpt] = useState<AiBudgetOptimizerResult | null>(
    null,
  );
  const [missing, setMissing] = useState<AiMissingServicesResult | null>(null);
  const [styleMatch, setStyleMatch] = useState<AiStyleMatchResult | null>(null);
  const [similar, setSimilar] = useState<AiSimilarEventsResult | null>(null);

  const [offerItem, setOfferItem] = useState<MarketplaceItem | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [messageItem, setMessageItem] = useState<MarketplaceItem | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);

  const canOffer = isAuthenticated && role === "Customer";
  const canMessage = isAuthenticated && role === "Customer";
  const recommendations = plan?.recommendations ?? [];

  function scrollToResults() {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function runActiveTab(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const payload = { prompt: trimmed };
      switch (activeTab) {
        case "plan": {
          setPlan(null);
          const result = await fetchAiEventPlan(payload);
          setPlan(result);
          break;
        }
        case "moodboard": {
          setMoodboard(null);
          setMoodboard(await fetchAiMoodboard(payload));
          break;
        }
        case "budget": {
          setBudgetOpt(null);
          setBudgetOpt(await fetchAiBudgetOptimizer(payload));
          break;
        }
        case "missing": {
          setMissing(null);
          setMissing(await fetchAiMissingServices(payload));
          break;
        }
        case "style": {
          setStyleMatch(null);
          setStyleMatch(await fetchAiStyleMatch(payload));
          break;
        }
        case "similar": {
          setSimilar(null);
          setSimilar(await fetchAiSimilarEvents(payload));
          break;
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.log(`AI ${activeTab} failed`, err.body);
      }
      setError(
        formatApiErrorMessage(err, "Analiz alınamadı. API bağlantısını kontrol edin."),
      );
    } finally {
      setLoading(false);
      scrollToResults();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runActiveTab(prompt);
  }

  function openOfferModal(rec: AiRecommendationItem) {
    setOfferItem(recommendationToMarketplaceItem(rec));
    setOfferOpen(true);
  }

  function openMessageModal(rec: AiRecommendationItem) {
    setMessageItem(recommendationToMarketplaceItem(rec));
    setMessageOpen(true);
  }

  function renderTabResults() {
    if (loading) {
      return activeTab === "plan" ? (
        <AiPlannerResults
          plan={null}
          recommendations={[]}
          loading
          hasSearched={hasSearched}
          error={null}
          canOffer={canOffer}
          canMessage={canMessage}
          onRetry={() => void runActiveTab(prompt)}
          onRequestOffer={openOfferModal}
          onMessageSend={openMessageModal}
        />
      ) : (
        <AiIntelligenceLoading />
      );
    }

    if (error) {
      return (
        <AiIntelligenceError
          message={error}
          onRetry={() => void runActiveTab(prompt)}
        />
      );
    }

    switch (activeTab) {
      case "plan":
        return (
          <AiPlannerResults
            plan={plan}
            recommendations={recommendations}
            loading={false}
            hasSearched={hasSearched}
            error={null}
            canOffer={canOffer}
            canMessage={canMessage}
            onRetry={() => void runActiveTab(prompt)}
            onRequestOffer={openOfferModal}
            onMessageSend={openMessageModal}
          />
        );
      case "moodboard":
        return (
          <AiMoodboardPanel data={moodboard} hasSearched={hasSearched} />
        );
      case "budget":
        return (
          <AiBudgetOptimizerPanel data={budgetOpt} hasSearched={hasSearched} />
        );
      case "missing":
        return (
          <AiMissingServicesPanel data={missing} hasSearched={hasSearched} />
        );
      case "style":
        return (
          <AiStyleMatchPanel
            data={styleMatch}
            hasSearched={hasSearched}
            canOffer={canOffer}
            onRequestOffer={openOfferModal}
          />
        );
      case "similar":
        return (
          <AiSimilarEventsPanel data={similar} hasSearched={hasSearched} />
        );
      default:
        return null;
    }
  }

  return (
    <DemoShell
      title="AI Etkinlik Planlayıcı"
      subtitle="ORIVONA Intelligence — plan, moodboard, bütçe, stil ve benzer etkinlik analizi."
    >
      <AiPlannerTabs active={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className={`${glassCard} mb-8`}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-violet-300/90">
            Etkinlik isteğiniz
          </span>
          <textarea
            className="min-h-[160px] w-full resize-y rounded-2xl border border-violet-500/25 bg-[#0a0612]/80 px-4 py-4 text-sm leading-relaxed text-white shadow-[inset_0_1px_0_rgba(167,139,250,0.06)] placeholder:text-zinc-600 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_PLACEHOLDER}
            required
            minLength={12}
            maxLength={4000}
            disabled={loading}
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading
              ? "ORIVONA Intelligence analiz ediyor..."
              : submitLabelForTab(activeTab)}
          </button>
          <button
            type="button"
            className="text-xs text-zinc-500 transition hover:text-violet-200"
            disabled={loading}
            onClick={() => setPrompt(EXAMPLE_PROMPT)}
          >
            Örnek metni kullan
          </button>
        </div>
      </form>

      <div ref={resultsRef}>{renderTabResults()}</div>

      {activeTab === "plan" && plan ? (
        <div className={`${glassCard} mt-8 space-y-6`}>
          <SavedAiPlansPanel
            planPayload={plan}
            onOpenPlan={() => {
              toast.success("Kayıtlı plan yüklendi.");
            }}
          />
          <VendorMatchSection
            matchPayload={plan}
            onOfferRequest={(serviceId) => {
              const rec = plan.recommendations?.find(
                (r) =>
                  String(r.vendorServiceId ?? r.serviceId) ===
                  String(serviceId),
              );
              if (rec) {
                openOfferModal(rec);
                return;
              }
              openOfferModal({
                vendorServiceId: serviceId,
                serviceId,
              });
            }}
          />
        </div>
      ) : null}

      <OfferRequestModal
        item={offerItem}
        open={offerOpen}
        onClose={() => {
          setOfferOpen(false);
          setOfferItem(null);
        }}
        onSuccess={(msg) => toast.success(msg || OFFER_REQUEST_SUCCESS_MESSAGE)}
      />
      <StartConversationModal
        item={messageItem}
        open={messageOpen}
        onClose={() => {
          setMessageOpen(false);
          setMessageItem(null);
        }}
        onSuccess={() =>
          toast.success("Konuşma başlatıldı. Mesajlar panelinizde.")
        }
      />
    </DemoShell>
  );
}
