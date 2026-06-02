"use client";

import type { InvitationDesign, InvitationRevision } from "@/src/lib/api/types";
import { InvitationDesignPreview } from "@/src/components/invitation-design/InvitationDesignPreview";
import {
  invitationDesignPreviewUrl,
  invitationDesignTitle,
} from "@/src/lib/invitationDesign";
import { btnSecondary, glassCard } from "@/src/lib/ui";

type InvitationDesignDetailPanelProps = {
  design?: InvitationDesign;
  revisions?: InvitationRevision[];
  variant: "customer" | "vendor";
  onUploadRevision?: () => void;
  uploadingRevision?: boolean;
};

export function InvitationDesignDetailPanel({
  design,
  revisions = [],
  variant,
  onUploadRevision,
  uploadingRevision,
}: InvitationDesignDetailPanelProps) {
  if (!design?.id && !design?.fileUrl && !design?.designJson) {
    return null;
  }

  const fileUrl = invitationDesignPreviewUrl(design);

  return (
    <div className={`${glassCard} mt-4 border-violet-400/20`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">
        Davetiye tasarımı
      </p>
      <p className="mt-1 text-sm font-medium text-white">
        {invitationDesignTitle(design)}
      </p>
      <div className="mt-4">
        <InvitationDesignPreview design={design} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnSecondary} text-xs`}
          >
            Önizle
          </a>
        ) : null}
        {fileUrl ? (
          <a
            href={fileUrl}
            download={design.fileName ?? true}
            className={`${btnSecondary} text-xs`}
          >
            Dosyayı indir
          </a>
        ) : null}
        {variant === "vendor" && onUploadRevision ? (
          <button
            type="button"
            className={`${btnSecondary} text-xs`}
            onClick={onUploadRevision}
            disabled={uploadingRevision}
          >
            {uploadingRevision ? "Yükleniyor…" : "Revizyon / taslak yükle"}
          </button>
        ) : null}
      </div>

      {revisions.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {variant === "customer" ? "İşletme revizyonları" : "Yüklediğiniz revizyonlar"}
          </p>
          <ul className="mt-3 space-y-2">
            {revisions.map((rev) =>
              rev.id != null || rev.fileUrl ? (
                <li
                  key={String(rev.id ?? rev.fileUrl)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                >
                  <span className="text-zinc-300">
                    {rev.fileName ?? "Revizyon"}
                    {rev.createdAt
                      ? ` · ${new Date(rev.createdAt).toLocaleDateString("tr-TR")}`
                      : ""}
                  </span>
                  {rev.fileUrl ? (
                    <a
                      href={rev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-300 hover:text-violet-100"
                    >
                      Görüntüle
                    </a>
                  ) : null}
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
