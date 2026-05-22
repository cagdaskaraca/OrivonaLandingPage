"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/src/contexts/ToastContext";
import { StarRating, formatRatingDisplay } from "@/src/components/reviews/StarRating";
import { fetchServiceReviews, submitServiceReview } from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { ServiceReview } from "@/src/lib/api/types";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

type ServiceReviewsSectionProps = {
  serviceId: string | number;
  canSubmit?: boolean;
  fallbackRating?: number;
  fallbackReviewCount?: number;
};

function reviewerName(review: ServiceReview): string {
  return (
    review.customerName?.trim() ||
    review.authorName?.trim() ||
    "Müşteri"
  );
}

export function ServiceReviewsSection({
  serviceId,
  canSubmit = false,
  fallbackRating,
  fallbackReviewCount,
}: ServiceReviewsSectionProps) {
  const toast = useToast();
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [averageRating, setAverageRating] = useState<number | undefined>(
    fallbackRating,
  );
  const [reviewCount, setReviewCount] = useState<number | undefined>(
    fallbackReviewCount,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitRating, setSubmitRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServiceReviews(serviceId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating ?? fallbackRating);
      setReviewCount(data.reviewCount ?? fallbackReviewCount);
    } catch (err) {
      logApiError("Service reviews fetch failed", err);
      setError(formatUiErrorMessage(err, "Değerlendirmeler yüklenemedi."));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId, fallbackRating, fallbackReviewCount]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitRating < 1) {
      setSubmitError("Lütfen 1–5 arası puan verin.");
      return;
    }
    if (!comment.trim()) {
      setSubmitError("Lütfen bir yorum yazın.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitServiceReview(serviceId, {
        rating: submitRating,
        comment: comment.trim(),
      });
      setSubmitRating(0);
      setComment("");
      toast.success("Değerlendirmeniz gönderildi.");
      await load();
    } catch (err) {
      logApiError("Submit review failed", err);
      setSubmitError(
        formatUiErrorMessage(err, "Değerlendirme gönderilemedi."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = averageRating ?? fallbackRating;
  const displayCount = reviewCount ?? fallbackReviewCount ?? reviews.length;

  return (
    <section className={glassCard}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Değerlendirmeler</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Müşteri deneyimleri ve puanlar
          </p>
        </div>
        {!loading && displayRating != null ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-300/20 bg-gradient-to-br from-amber-500/10 to-violet-500/10 px-4 py-3">
            <span className="text-3xl font-bold text-amber-100">
              {formatRatingDisplay(displayRating)}
            </span>
            <div>
              <StarRating value={displayRating} size="sm" />
              <p className="mt-1 text-xs text-zinc-400">
                {displayCount}{" "}
                {displayCount === 1 ? "değerlendirme" : "değerlendirme"}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4"
            >
              <div className="h-4 w-24 rounded bg-white/[0.08]" />
              <div className="mt-3 h-3 w-full rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-red-300/90">{error}</p>
      ) : reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
          <p className="text-base font-medium text-zinc-200">
            Henüz değerlendirme yok
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Bu hizmet için ilk yorumu siz yazabilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id != null ? String(review.id) : `${review.createdAt}-${review.rating}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">
                  {reviewerName(review)}
                </p>
                {review.createdAt ? (
                  <time
                    className="text-xs text-zinc-500"
                    dateTime={review.createdAt}
                  >
                    {formatRelativeTime(review.createdAt)}
                  </time>
                ) : null}
              </div>
              {review.rating != null ? (
                <div className="mt-2">
                  <StarRating value={review.rating} size="sm" />
                </div>
              ) : null}
              {review.comment?.trim() ? (
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {review.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-white">Değerlendirme yaz</h3>
        {canSubmit ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs text-zinc-400">Puanınız</p>
              <StarRating
                value={submitRating}
                onChange={setSubmitRating}
                size="lg"
                label="Puan seçin"
              />
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Yorum</span>
              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deneyiminizi paylaşın…"
                maxLength={2000}
                required
              />
            </label>
            {submitError ? (
              <p className="text-sm text-red-300/90">{submitError}</p>
            ) : null}
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? "Gönderiliyor…" : "Değerlendirmeyi gönder"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            Değerlendirme yazmak için{" "}
            <Link href="/login" className="text-violet-300 hover:text-violet-200">
              müşteri olarak giriş yapın
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
