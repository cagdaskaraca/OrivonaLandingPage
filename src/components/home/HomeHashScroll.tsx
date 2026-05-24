"use client";

import { useHomeHashScroll } from "@/src/hooks/useHomeHashScroll";

type HomeHashScrollProps = {
  marketplacePreviewLoading?: boolean;
};

/** Handles /#section navigation when landing on the homepage from other routes. */
export function HomeHashScroll({
  marketplacePreviewLoading = false,
}: HomeHashScrollProps) {
  useHomeHashScroll({ isLoading: marketplacePreviewLoading });
  return null;
}
