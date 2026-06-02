"use client";

import { InvitationCanvasPreview } from "@/src/components/invitation-design/editor/InvitationCanvasPreview";
import { InvitationEditorFontProvider } from "@/src/components/invitation-design/editor/InvitationEditorFontProvider";
import type { InvitationDesign, InvitationEditorJson } from "@/src/lib/api/types";
import { parseInvitationDocument } from "@/src/lib/invitationEditor/document";
import {
  invitationDesignPreviewUrl,
  parseInvitationEditorJson,
} from "@/src/lib/invitationDesign";

type InvitationDesignPreviewProps = {
  design: InvitationDesign;
  editorJson?: InvitationEditorJson | null;
  className?: string;
  compact?: boolean;
  /** Opak, editör içi canlı önizleme */
  variant?: "default" | "editor";
  /** Teklif kartı: önizlenecek veri yoksa kısa hata metni */
  showLoadError?: boolean;
};

function isPdfMime(mime?: string): boolean {
  return (mime ?? "").toLowerCase().includes("pdf");
}

function LegacyInvitationPreview({
  design,
  editorJson,
  className,
  compact,
  variant,
  showLoadError,
}: InvitationDesignPreviewProps) {
  const previewUrl = invitationDesignPreviewUrl(design);
  const fileUrl = design.fileUrl?.trim();
  const parsed =
    editorJson ?? parseInvitationEditorJson(design.designJson);

  if (previewUrl) {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-violet-400/25 bg-black/20 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={design.title ?? "Davetiye"}
          className={`w-full object-cover ${compact ? "max-h-40" : "max-h-72"}`}
        />
      </div>
    );
  }

  if (design.sourceType === "Upload" && fileUrl) {
    if (isPdfMime(design.mimeType)) {
      return (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-8 text-center ${className}`}
        >
          <p className="text-sm font-medium text-violet-100">PDF davetiye</p>
          <p className="mt-1 text-xs text-zinc-400">
            {design.fileName ?? "dosya.pdf"}
          </p>
        </div>
      );
    }
    return (
      <div
        className={`overflow-hidden rounded-xl border border-violet-400/25 bg-black/20 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={design.title ?? "Davetiye"}
          className={`w-full object-cover ${compact ? "max-h-40" : "max-h-72"}`}
        />
      </div>
    );
  }

  if (parsed) {
    const minH =
      compact ? "min-h-[160px]" : variant === "editor" ? "min-h-0" : "min-h-[240px]";
    const editorShell =
      variant === "editor"
        ? "border-violet-400/30 bg-[#0a0612] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        : "border-violet-400/25 bg-black";

    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border px-6 py-8 text-center ${editorShell} ${minH} ${className}`}
        style={{ backgroundColor: parsed.backgroundColor }}
      >
        {parsed.imageUrl ? (
          <div
            className={`absolute inset-0 ${variant === "editor" ? "opacity-35" : "opacity-30"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={parsed.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="relative z-10 max-w-md space-y-2">
          <p
            className="font-semibold tracking-wide"
            style={{
              color: parsed.textColor,
              fontSize: `${Math.max(16, parsed.fontSize + 6)}px`,
            }}
          >
            {parsed.title || "Başlık"}
          </p>
          {parsed.dateText ? (
            <p
              className="text-sm opacity-90"
              style={{ color: parsed.textColor }}
            >
              {parsed.dateText}
            </p>
          ) : null}
          {parsed.description ? (
            <p
              className="text-sm leading-relaxed opacity-85"
              style={{
                color: parsed.textColor,
                fontSize: `${parsed.fontSize}px`,
              }}
            >
              {parsed.description}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (showLoadError) {
    return (
      <div
        className={`rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-6 text-center text-sm text-amber-100/90 ${className}`}
      >
        Taslak bilgisi alınamadı
      </div>
    );
  }

  if (!showLoadError && variant === "editor") {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-dashed border-violet-400/30 bg-violet-500/5 px-4 py-10 text-center text-sm text-zinc-500 ${className}`}
    >
      Önizleme yok
    </div>
  );
}

export function InvitationDesignPreview(props: InvitationDesignPreviewProps) {
  const { design, className, compact, variant } = props;

  if (design.sourceType === "Upload") {
    return <LegacyInvitationPreview {...props} />;
  }

  const doc = parseInvitationDocument(design.designJson);
  if (doc.version === 2) {
    return (
      <InvitationEditorFontProvider>
        <InvitationCanvasPreview
          document={doc}
          viewport={compact ? "mobile" : "a4"}
          className={className}
        />
      </InvitationEditorFontProvider>
    );
  }

  return <LegacyInvitationPreview {...props} />;
}
