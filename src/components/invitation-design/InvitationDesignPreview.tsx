"use client";

import type { InvitationDesign, InvitationEditorJson } from "@/src/lib/api/types";
import {
  invitationDesignPreviewUrl,
  parseInvitationEditorJson,
} from "@/src/lib/invitationDesign";

type InvitationDesignPreviewProps = {
  design: InvitationDesign;
  editorJson?: InvitationEditorJson | null;
  className?: string;
  compact?: boolean;
};

export function InvitationDesignPreview({
  design,
  editorJson: editorJsonProp,
  className = "",
  compact = false,
}: InvitationDesignPreviewProps) {
  const fileUrl = invitationDesignPreviewUrl(design);
  const editorJson =
    editorJsonProp ?? parseInvitationEditorJson(design.designJson);

  if (design.sourceType === "Upload" && fileUrl) {
    const isPdf = (design.mimeType ?? "").includes("pdf");
    if (isPdf) {
      return (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-8 text-center ${className}`}
        >
          <p className="text-sm font-medium text-violet-100">PDF davetiye</p>
          <p className="mt-1 text-xs text-zinc-400">{design.fileName ?? "dosya.pdf"}</p>
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

  if (!editorJson) {
    return (
      <div
        className={`rounded-xl border border-dashed border-violet-400/30 bg-violet-500/5 px-4 py-10 text-center text-sm text-zinc-500 ${className}`}
      >
        Önizleme yok
      </div>
    );
  }

  const minH = compact ? "min-h-[160px]" : "min-h-[240px]";

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-violet-400/30 px-6 py-8 text-center shadow-[0_0_40px_rgba(139,92,246,0.12)] ${minH} ${className}`}
      style={{ backgroundColor: editorJson.backgroundColor }}
    >
      {editorJson.imageUrl ? (
        <div className="absolute inset-0 opacity-25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={editorJson.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="relative z-10 max-w-md space-y-2">
        <p
          className="font-semibold tracking-wide"
          style={{
            color: editorJson.textColor,
            fontSize: `${Math.max(16, editorJson.fontSize + 6)}px`,
          }}
        >
          {editorJson.title || "Başlık"}
        </p>
        {editorJson.dateText ? (
          <p
            className="text-sm opacity-90"
            style={{ color: editorJson.textColor }}
          >
            {editorJson.dateText}
          </p>
        ) : null}
        {editorJson.description ? (
          <p
            className="text-sm leading-relaxed opacity-85"
            style={{
              color: editorJson.textColor,
              fontSize: `${editorJson.fontSize}px`,
            }}
          >
            {editorJson.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
