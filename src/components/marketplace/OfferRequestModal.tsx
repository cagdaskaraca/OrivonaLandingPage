"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { createOfferRequest } from "@/src/lib/api";
import type { CouponValidation } from "@/src/lib/api/commerce";
import { getEventPlanAgreements } from "@/src/lib/api/customerAgreements";
import { attachInvitationDesignToEventRequest } from "@/src/lib/api/invitationDesigns";
import { attachPlaylistToEventRequest } from "@/src/lib/api/eventPlaylist";
import { fetchMyEventPlans } from "@/src/lib/api/eventPlans";
import { findActiveAgreementForCategory } from "@/src/lib/customerAgreementsUi";
import { saveOfferRequestCoupon } from "@/src/lib/offerCouponStorage";
import { ApiError, formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventPlan, MarketplaceItem } from "@/src/lib/api/types";
import { VENDOR_CATEGORY_NAMES } from "@/src/lib/api/types";
import {
  InvitationDesignPicker,
  isInvitationDesignSelected,
} from "@/src/components/invitation-design/InvitationDesignPicker";
import { isInvitationCategory } from "@/src/lib/invitationDesign";
import { isMusicCategory } from "@/src/lib/playlist";
import { CouponCodeField } from "@/src/components/commerce/CouponCodeField";
import { PaymentComingSoonNotice } from "@/src/components/commerce/PaymentComingSoonNotice";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { OrivonaDatePicker } from "@/src/components/ui/OrivonaDatePicker";
import { btnPrimary, inputClass, selectClass } from "@/src/lib/ui";

const SUCCESS_MESSAGE = "Teklif talebiniz işletmeye gönderildi.";
const PLAN_PLACEHOLDER = "";
const NO_PLAN_VALUE = "__none__";

function formatPlanDate(iso?: string): string {
  if (!iso?.trim()) return "";
  const slice = iso.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : "";
}

function planLabel(plan: EventPlan): string {
  const title = plan.title?.trim() || plan.eventType?.trim() || "Etkinlik";
  const date = formatPlanDate(plan.eventDate);
  const loc = [plan.city, plan.district].filter(Boolean).join(" · ");
  return [title, date, loc].filter(Boolean).join(" · ");
}

function isRealPlanId(value: string): boolean {
  return value !== "" && value !== NO_PLAN_VALUE;
}

type OfferRequestModalProps = {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  /** Pre-fill event date (e.g. from availability calendar). */
  initialEventDate?: string;
};

export function OfferRequestModal({
  item,
  open,
  onClose,
  onSuccess,
  initialEventDate,
}: OfferRequestModalProps) {
  const [message, setMessage] = useState("");
  const [guestCount, setGuestCount] = useState(100);
  const [eventDate, setEventDate] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(PLAN_PLACEHOLDER);
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [invitationDesignId, setInvitationDesignId] = useState("");
  const [attachPlaylist, setAttachPlaylist] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidation | null>(
    null,
  );
  const [couponDraftUnapplied, setCouponDraftUnapplied] = useState(false);
  const [planAgreementsLoading, setPlanAgreementsLoading] = useState(false);
  const [blockingAgreement, setBlockingAgreement] = useState<{
    vendorName?: string;
    category?: string;
  } | null>(null);
  const lastAutofillPlanId = useRef<string | null>(null);

  const hasPlans = plans.length > 0;
  const hasLinkedPlan = isRealPlanId(selectedPlanId);
  const showInvitationPicker =
    isInvitationCategory(category) && hasLinkedPlan;
  const showPlaylistAttach =
    isMusicCategory(category) && hasLinkedPlan;

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const list = await fetchMyEventPlans();
      setPlans(list);
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setMessage("");
    setGuestCount(100);
    setEventDate("");
    setCity("");
    setDistrict("");
    setBudgetMin(0);
    setBudgetMax(0);
    setSelectedPlanId(PLAN_PLACEHOLDER);
    setInvitationDesignId("");
    setAttachPlaylist(false);
    setValidatedCoupon(null);
    setCouponDraftUnapplied(false);
    setBlockingAgreement(null);
    lastAutofillPlanId.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      return;
    }
    void loadPlans();
    const itemCategory =
      item?.categoryName?.trim() || item?.category?.trim() || "";
    setCategory(itemCategory || "Davetiye");
    if (initialEventDate?.trim()) {
      setEventDate(initialEventDate.trim().slice(0, 10));
    }
  }, [open, initialEventDate, loadPlans, item?.category, item?.categoryName]);

  useEffect(() => {
    if (!hasLinkedPlan) {
      lastAutofillPlanId.current = null;
      return;
    }
    if (lastAutofillPlanId.current === selectedPlanId) return;
    const plan = plans.find((p) => String(p.id) === selectedPlanId);
    if (!plan) return;
    lastAutofillPlanId.current = selectedPlanId;
    setCity(plan.city ?? "");
    setDistrict(plan.district ?? "");
    setEventDate(formatPlanDate(plan.eventDate));
    setGuestCount(plan.guestCount ?? 100);
    setBudgetMin(plan.budgetMin ?? 0);
    setBudgetMax(plan.budgetMax ?? 0);
    setInvitationDesignId("");
  }, [selectedPlanId, plans, hasLinkedPlan]);

  useEffect(() => {
    if (!hasLinkedPlan) {
      setBlockingAgreement(null);
      return;
    }
    let cancelled = false;
    setPlanAgreementsLoading(true);
    void (async () => {
      try {
        const result = await getEventPlanAgreements(selectedPlanId);
        if (cancelled) return;
        const existing = findActiveAgreementForCategory(
          result.items,
          category,
        );
        setBlockingAgreement(
          existing
            ? {
                vendorName: existing.vendorName,
                category: existing.category ?? existing.categoryName,
              }
            : null,
        );
      } catch {
        if (!cancelled) setBlockingAgreement(null);
      } finally {
        if (!cancelled) setPlanAgreementsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPlanId, category, hasLinkedPlan]);

  const serviceId = item?.vendorServiceId ?? item?.id;
  const offerBlocked = hasLinkedPlan && blockingAgreement != null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null) {
      setError("Hizmet kimliği bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }
    if (hasPlans && selectedPlanId === PLAN_PLACEHOLDER) {
      setError("Lütfen bir etkinlik planı seçin veya etkinliksiz teklif alın.");
      return;
    }
    if (offerBlocked) {
      setError(
        "Bu etkinlik için seçili kategoride zaten kabul edilmiş bir teklif var. Yeni teklif alınamaz.",
      );
      return;
    }
    if (couponDraftUnapplied) {
      setError(
        "Kupon kodunu «Uygula» ile doğrulayın veya kupon alanını boş bırakın.",
      );
      return;
    }
    const couponCode = validatedCoupon?.valid
      ? validatedCoupon.code?.trim().toUpperCase()
      : undefined;
    setLoading(true);
    setError(null);
    try {
      const noteText = message.trim();
      const linkedPlan = hasLinkedPlan
        ? plans.find((p) => String(p.id) === selectedPlanId)
        : undefined;
      const created = await createOfferRequest({
        vendorServiceId: serviceId,
        message: noteText,
        eventDate: eventDate.trim(),
        guestCount,
        eventPlanId: hasLinkedPlan ? selectedPlanId : null,
        category: category.trim() || linkedPlan?.eventType,
        city: hasPlans ? city.trim() || undefined : undefined,
        district: hasPlans ? district.trim() || undefined : undefined,
        budgetMin: hasPlans && budgetMin > 0 ? budgetMin : undefined,
        budgetMax: hasPlans && budgetMax > 0 ? budgetMax : undefined,
        note: noteText || undefined,
        couponCode,
      });
      const requestId = created.eventRequestId ?? created.id;
      if (requestId != null && couponCode) {
        saveOfferRequestCoupon(requestId, couponCode);
      }
      if (requestId != null && isInvitationDesignSelected(invitationDesignId)) {
        try {
          await attachInvitationDesignToEventRequest(
            requestId,
            invitationDesignId,
          );
        } catch (attachErr) {
          logApiError("Attach invitation to offer request", attachErr);
        }
      }
      if (requestId != null && attachPlaylist && hasLinkedPlan) {
        try {
          await attachPlaylistToEventRequest(requestId, selectedPlanId);
        } catch (attachErr) {
          logApiError("Attach playlist to offer request", attachErr);
        }
      }
      resetForm();
      onSuccess(SUCCESS_MESSAGE);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        console.log("Offer request failed", err.body);
        setError(
          formatUiErrorMessage(err, "Teklif talebi gönderilemedi."),
        );
      } else {
        setError("Teklif talebi gönderilemedi.");
      }
    } finally {
      setLoading(false);
    }
  }

  const title = item?.serviceTitle ?? item?.title ?? "Hizmet";

  return (
    <Modal open={open} title={`Teklif İste — ${title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPlans ? (
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik seç</span>
            <select
              className={selectClass}
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={plansLoading}
              required
            >
              <option value={PLAN_PLACEHOLDER} disabled>
                Etkinlik planı seç
              </option>
              <option value={NO_PLAN_VALUE}>Etkinliksiz teklif al</option>
              {plans.map((plan) =>
                plan.id != null ? (
                  <option key={String(plan.id)} value={String(plan.id)}>
                    {planLabel(plan)}
                  </option>
                ) : null,
              )}
            </select>
            {plansLoading ? (
              <p className="mt-1 text-xs text-zinc-500">Planlar yükleniyor…</p>
            ) : null}
          </label>
        ) : null}

        {hasPlans ? (
          <>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İstanbul"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
              <input
                className={inputClass}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Kadıköy"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">
                  Bütçe min (₺)
                </span>
                <NumericInput
                  value={budgetMin}
                  onChange={setBudgetMin}
                  min={0}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">
                  Bütçe max (₺)
                </span>
                <NumericInput
                  value={budgetMax}
                  onChange={setBudgetMax}
                  min={0}
                />
              </label>
            </div>
          </>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Kategori</span>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setInvitationDesignId("");
              setAttachPlaylist(false);
            }}
          >
            {VENDOR_CATEGORY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {showInvitationPicker ? (
          <InvitationDesignPicker
            eventPlanId={selectedPlanId}
            value={invitationDesignId}
            onChange={setInvitationDesignId}
          />
        ) : null}

        {showPlaylistAttach ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-violet-500"
              checked={attachPlaylist}
              onChange={(e) => setAttachPlaylist(e.target.checked)}
            />
            <span>
              <span className="font-medium text-violet-100">
                Playlist&apos;i teklife ekle
              </span>
              <span className="mt-0.5 block text-xs text-zinc-400">
                Seçili etkinlik planındaki müzik listesi davetiyeci ile
                paylaşılır.
              </span>
            </span>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            {hasPlans ? "Not / mesaj" : "Mesajınız"}
          </span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Etkinliğiniz ve beklentileriniz hakkında kısa bilgi…"
            required={!hasPlans}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Misafir sayısı</span>
          <NumericInput
            value={guestCount}
            onChange={setGuestCount}
            min={1}
            required
          />
        </label>
        <OrivonaDatePicker
          label="Etkinlik tarihi"
          value={eventDate}
          onChange={setEventDate}
        />
        {offerBlocked ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            Bu etkinlikte{" "}
            <span className="font-medium">
              {blockingAgreement?.category ?? category}
            </span>{" "}
            kategorisinde{" "}
            {blockingAgreement?.vendorName
              ? `${blockingAgreement.vendorName} ile `
              : ""}
            kabul edilmiş bir teklif bulunuyor. Aynı kategori için yeni teklif
            alınamaz.
          </div>
        ) : null}
        {hasLinkedPlan && planAgreementsLoading ? (
          <p className="text-xs text-zinc-500">Etkinlik teklifleri kontrol ediliyor…</p>
        ) : null}
        {serviceId != null ? (
          <CouponCodeField
            serviceId={serviceId}
            basePrice={item?.price ?? item?.basePrice}
            applyLabel="Uygula"
            onValidated={setValidatedCoupon}
            onDraftChange={(_draft, unapplied) =>
              setCouponDraftUnapplied(unapplied)
            }
          />
        ) : null}
        <PaymentComingSoonNotice compact />
        {error ? (
          <div
            role="alert"
            className="whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          className={`${btnPrimary} w-full`}
          disabled={loading || offerBlocked || planAgreementsLoading}
        >
          {loading ? "Gönderiliyor…" : "Teklif Gönder"}
        </button>
      </form>
    </Modal>
  );
}

export { SUCCESS_MESSAGE as OFFER_REQUEST_SUCCESS_MESSAGE };
