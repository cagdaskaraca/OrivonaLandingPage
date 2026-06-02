import Link from "next/link";
import { InvitationDesignDetailPanel } from "@/src/components/invitation-design/InvitationDesignDetailPanel";
import { PlaylistDetailPanel } from "@/src/components/playlist/PlaylistDetailPanel";
import { OfferStatusBadge } from "@/src/components/offers/OfferStatusBadge";
import type { OfferRequest } from "@/src/lib/api/types";
import {
  hasInvitationDesignData,
  isInvitationCategory,
} from "@/src/lib/invitationDesign";
import { isMusicCategory } from "@/src/lib/playlist";
import {
  formatOfferDate,
  offerResponseDescription,
  offerResponsePrice,
} from "@/src/lib/offerRequest";

type OfferRequestCardProps = {
  offer: OfferRequest;
  variant: "customer" | "vendor";
  onUploadRevision?: () => void;
  uploadingRevision?: boolean;
};

export function OfferRequestCard({
  offer,
  variant,
  onUploadRevision,
  uploadingRevision,
}: OfferRequestCardProps) {
  const price = offerResponsePrice(offer);
  const responseText = offerResponseDescription(offer);
  const serviceHref =
    offer.vendorServiceId != null
      ? `/services/${encodeURIComponent(String(offer.vendorServiceId))}`
      : null;
  const showInvitation =
    isInvitationCategory(offer.category) ||
    isInvitationCategory(offer.serviceTitle);
  const showPlaylist =
    isMusicCategory(offer.category) || isMusicCategory(offer.serviceTitle);

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {serviceHref ? (
            <Link
              href={serviceHref}
              className="font-medium text-white hover:text-violet-200"
            >
              {offer.serviceTitle ?? "Hizmet"}
            </Link>
          ) : (
            <p className="font-medium text-white">{offer.serviceTitle ?? "Hizmet"}</p>
          )}
          <p className="mt-1 text-zinc-400">
            {variant === "customer"
              ? (offer.vendorName ?? "İşletme")
              : (offer.customerName ?? "Müşteri")}
          </p>
        </div>
        <OfferStatusBadge status={offer.status} />
      </div>

      {offer.message ? (
        <p className="mt-3 leading-relaxed text-zinc-300">{offer.message}</p>
      ) : null}

      {showInvitation && hasInvitationDesignData(offer.invitationDesign) ? (
        <InvitationDesignDetailPanel
          design={offer.invitationDesign}
          revisions={offer.invitationRevisions}
          variant={variant}
          onUploadRevision={variant === "vendor" ? onUploadRevision : undefined}
          uploadingRevision={uploadingRevision}
        />
      ) : null}

      {showPlaylist ? (
        <PlaylistDetailPanel items={offer.playlist} variant={variant} />
      ) : null}

      <dl className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Etkinlik tarihi</dt>
          <dd className="text-zinc-200">{formatOfferDate(offer.eventDate)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Misafir sayısı</dt>
          <dd className="text-zinc-200">
            {offer.guestCount != null ? `${offer.guestCount} kişi` : "—"}
          </dd>
        </div>
        {offer.createdAt ? (
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Talep tarihi</dt>
            <dd className="text-zinc-200">{formatOfferDate(offer.createdAt)}</dd>
          </div>
        ) : null}
      </dl>

      {price != null || responseText || offer.validUntil ? (
        <div className="mt-4 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            İşletme teklifi
          </p>
          {price != null ? (
            <p className="mt-2 text-base font-semibold text-white">
              {price.toLocaleString("tr-TR")} ₺
            </p>
          ) : null}
          {responseText ? (
            <p className="mt-1 text-zinc-300">{responseText}</p>
          ) : null}
          {offer.validUntil ? (
            <p className="mt-2 text-xs text-zinc-400">
              Geçerlilik: {formatOfferDate(offer.validUntil)}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
