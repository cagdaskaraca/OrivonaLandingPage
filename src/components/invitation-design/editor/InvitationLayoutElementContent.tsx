"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Heart, Flower2, Sparkles, Star } from "lucide-react";
import { fontCssFamily } from "@/src/lib/invitationEditor/fonts";
import { getLayoutElementText } from "@/src/lib/invitationEditor/layout";
import type {
  InvitationEditorDocument,
  LayoutElement,
} from "@/src/lib/invitationEditor/types";

function QrImage({ url, size }: { url: string; size: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: Math.min(size, 256),
      margin: 1,
      color: { dark: "#1a0f2e", light: "#ffffff" },
    })
      .then((data) => {
        if (!cancelled) setSrc(data);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url, size]);
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded bg-white/90 text-[10px] text-zinc-600">
        QR
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-full w-full rounded object-contain" />
  );
}

function IconGlyph({
  icon,
  color,
}: {
  icon: "heart" | "rings" | "star" | "flower";
  color: string;
}) {
  const className = "h-full w-full";
  if (icon === "heart") return <Heart className={className} fill={color} color={color} />;
  if (icon === "star") return <Star className={className} fill={color} color={color} />;
  if (icon === "flower") return <Flower2 className={className} color={color} />;
  return <Sparkles className={className} color={color} />;
}

type InvitationLayoutElementContentProps = {
  el: LayoutElement;
  doc: InvitationEditorDocument;
  qrUrl: string;
};

export function InvitationLayoutElementContent({
  el,
  doc,
  qrUrl,
}: InvitationLayoutElementContentProps) {
  const fontFamily = fontCssFamily(el.fontFamily ?? doc.fontFamily);
  const color = el.color ?? doc.textColor;
  const fontSize = el.fontSize ?? doc.fontSize;

  if (el.type === "title" || el.type === "date" || el.type === "description" || el.type === "text") {
    const text = getLayoutElementText(el, doc);
    return (
      <div
        className="h-full w-full overflow-hidden whitespace-pre-wrap leading-snug"
        style={{
          color,
          fontFamily,
          fontSize,
          fontWeight: el.bold ? 700 : 400,
          fontStyle: el.italic ? "italic" : "normal",
          textAlign: el.align ?? "center",
          display: "flex",
          alignItems: "center",
          justifyContent:
            el.align === "left"
              ? "flex-start"
              : el.align === "right"
                ? "flex-end"
                : "center",
        }}
      >
        {text || "\u00a0"}
      </div>
    );
  }

  if (el.type === "image") {
    const url = el.url ?? doc.imageUrl;
    if (!url) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-violet-400/30 bg-violet-500/10 text-[10px] text-violet-200/80">
          Görsel
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
    );
  }

  if (el.type === "qr") {
    const size = Math.min(el.width, el.height);
    return <QrImage url={qrUrl} size={size} />;
  }

  if (el.type === "shape") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundColor: el.fill ?? doc.accentColor,
          opacity: el.opacity ?? 0.35,
          borderRadius: el.shape === "circle" ? "50%" : 8,
        }}
      />
    );
  }

  if (el.type === "icon" && el.icon) {
    return (
      <div className="flex h-full w-full items-center justify-center p-1">
        <IconGlyph icon={el.icon} color={el.color ?? doc.accentColor} />
      </div>
    );
  }

  return null;
}
