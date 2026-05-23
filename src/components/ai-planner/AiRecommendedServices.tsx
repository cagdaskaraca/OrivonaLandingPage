"use client";

import { MarketplaceServiceCard } from "@/src/components/marketplace/MarketplaceServiceCard";
import type { AiRecommendationItem } from "@/src/lib/api/types";
import { recommendationToMarketplaceItem } from "@/src/lib/aiPlanner";

type AiRecommendedServicesProps = {
  recommendations: AiRecommendationItem[];
  canOffer: boolean;
  canMessage: boolean;
  onRequestOffer: (rec: AiRecommendationItem) => void;
  onMessageSend: (rec: AiRecommendationItem) => void;
};

export function AiRecommendedServices({
  recommendations,
  canOffer,
  canMessage,
  onRequestOffer,
  onMessageSend,
}: AiRecommendedServicesProps) {
  return (
    <div className="grid auto-rows-fr gap-5 sm:grid-cols-2">
      {recommendations.map((rec, i) => {
        const item = recommendationToMarketplaceItem(rec);
        const key = String(item.vendorServiceId ?? item.id ?? i);
        return (
          <MarketplaceServiceCard
            key={key}
            item={item}
            showOfferButton={canOffer}
            showMessageButton={canMessage}
            onOfferRequest={canOffer ? () => onRequestOffer(rec) : undefined}
            onMessageSend={canMessage ? () => onMessageSend(rec) : undefined}
          />
        );
      })}
    </div>
  );
}
