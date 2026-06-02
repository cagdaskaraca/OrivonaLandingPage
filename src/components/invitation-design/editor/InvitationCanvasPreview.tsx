"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Heart, Flower2, Sparkles, Star } from "lucide-react";
import { fontCssFamily } from "@/src/lib/invitationEditor/fonts";
import { resolveQrUrl, syncLegacyTextFields } from "@/src/lib/invitationEditor/document";
import { getTemplate } from "@/src/lib/invitationEditor/templates";
import type {
  EditorElement,
  InvitationEditorDocument,
  InvitationQrUrls,
  PreviewViewport,
} from "@/src/lib/invitationEditor/types";

type InvitationCanvasPreviewProps = {
  document: InvitationEditorDocument;
  viewport: PreviewViewport;
  qrUrls?: InvitationQrUrls;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  interactive?: boolean;
  className?: string;
};

function IconGlyph({
  icon,
  size,
  color,
}: {
  icon: "heart" | "rings" | "star" | "flower";
  size: number;
  color: string;
}) {
  const props = { size, color, strokeWidth: 1.5 };
  if (icon === "heart") return <Heart {...props} fill={color} />;
  if (icon === "star") return <Star {...props} fill={color} />;
  if (icon === "flower") return <Flower2 {...props} />;
  return <Sparkles {...props} />;
}

function QrImage({ url, sizePx }: { url: string; sizePx: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: sizePx,
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
  }, [url, sizePx]);
  if (!src) {
    return (
      <div
        className="flex items-center justify-center rounded bg-white/90 text-[10px] text-zinc-600"
        style={{ width: sizePx, height: sizePx }}
      >
        QR
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="QR kod" width={sizePx} height={sizePx} className="rounded" />
  );
}

function RenderElement({
  el,
  doc,
  canvasWidth,
  selected,
  onSelect,
  interactive,
  qrUrl,
}: {
  el: EditorElement;
  doc: InvitationEditorDocument;
  canvasWidth: number;
  selected: boolean;
  onSelect?: () => void;
  interactive?: boolean;
  qrUrl: string;
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${el.x}%`,
    top: `${el.y}%`,
    cursor: interactive ? "pointer" : "default",
    outline: selected ? "2px solid rgba(196,181,253,0.9)" : undefined,
    outlineOffset: 2,
    zIndex: selected ? 20 : 10,
  };

  if (el.type === "text") {
    return (
      <div
        style={{
          ...style,
          width: `${el.width}%`,
          fontSize: el.fontSize,
          color: el.color,
          fontFamily: fontCssFamily(el.fontFamily),
          fontWeight: el.bold ? 700 : 400,
          fontStyle: el.italic ? "italic" : "normal",
          textAlign: el.align,
        }}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          onSelect?.();
        }}
        role={interactive ? "button" : undefined}
      >
        {el.content}
      </div>
    );
  }

  if (el.type === "image") {
    const w = (el.width / 100) * canvasWidth;
    const h = (el.height / 100) * canvasWidth * 1.2;
    return (
      <div style={style} onClick={(e) => { if (interactive) { e.stopPropagation(); onSelect?.(); } }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={el.url}
          alt=""
          style={{ width: w, height: h, objectFit: "cover", borderRadius: 8 }}
        />
      </div>
    );
  }

  if (el.type === "shape") {
    const w = (el.width / 100) * canvasWidth;
    const h = (el.height / 100) * canvasWidth * 1.2;
    return (
      <div
        style={{
          ...style,
          width: w,
          height: h,
          backgroundColor: el.fill,
          opacity: el.opacity,
          borderRadius: el.shape === "circle" ? "50%" : 8,
        }}
        onClick={(e) => { if (interactive) { e.stopPropagation(); onSelect?.(); } }}
      />
    );
  }

  if (el.type === "icon") {
    const px = (el.size / 100) * canvasWidth;
    return (
      <div style={style} onClick={(e) => { if (interactive) { e.stopPropagation(); onSelect?.(); } }}>
        <IconGlyph icon={el.icon} size={px} color={el.color} />
      </div>
    );
  }

  if (el.type === "qr") {
    const px = Math.round((el.size / 100) * canvasWidth);
    return (
      <div style={style} onClick={(e) => { if (interactive) { e.stopPropagation(); onSelect?.(); } }}>
        <QrImage url={qrUrl} sizePx={px} />
      </div>
    );
  }

  return null;
}

export function InvitationCanvasPreview({
  document: docInput,
  viewport,
  qrUrls = {},
  selectedElementId,
  onSelectElement,
  interactive = false,
  className = "",
}: InvitationCanvasPreviewProps) {
  const doc = useMemo(() => syncLegacyTextFields(docInput), [docInput]);
  const template = getTemplate(doc.templateId);
  const qrUrl = resolveQrUrl(doc, qrUrls);
  const aspect = viewport === "a4" ? "210 / 297" : "9 / 16";
  const canvasWidth = viewport === "a4" ? 320 : 280;

  const showBuiltInQr =
    doc.qr.enabled && !doc.elements.some((e) => e.type === "qr");

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="relative w-full overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.65)]"
        style={{
          maxWidth: viewport === "a4" ? 360 : 300,
          aspectRatio: aspect,
        }}
        onClick={() => interactive && onSelectElement?.(null)}
      >
        <div
          className={`absolute inset-0 ${template.borderClass} ${template.overlayClass}`}
          style={{ backgroundColor: doc.backgroundColor }}
        >
          {doc.imageUrl ? (
            <div className="absolute inset-0 opacity-25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div
            className="relative flex h-full flex-col items-center px-6 py-8 text-center"
            style={{
              color: doc.textColor,
              fontFamily: fontCssFamily(doc.fontFamily),
            }}
          >
            {template.ornament ? (
              <p
                className="mb-2 text-2xl"
                style={{ color: doc.accentColor }}
                aria-hidden
              >
                {template.ornament}
              </p>
            ) : null}

            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] opacity-80"
              style={{ color: doc.accentColor }}
            >
              Davet
            </p>

            <h3
              className="mt-3 leading-tight"
              style={{
                fontSize: Math.max(22, doc.fontSize + 8),
                color: doc.textColor,
                fontFamily: fontCssFamily(doc.fontFamily),
              }}
            >
              {doc.title}
            </h3>

            {doc.dateText ? (
              <p
                className="mt-3 text-sm opacity-90"
                style={{ color: doc.accentColor }}
              >
                {doc.dateText}
              </p>
            ) : null}

            {doc.description ? (
              <p
                className="mt-4 max-w-[90%] whitespace-pre-line text-sm leading-relaxed opacity-85"
                style={{ fontSize: doc.fontSize }}
              >
                {doc.description}
              </p>
            ) : null}

            {showBuiltInQr ? (
              <div className="mt-auto pt-6">
                <QrImage url={qrUrl} sizePx={viewport === "a4" ? 72 : 64} />
                <p className="mt-2 text-[9px] opacity-60">Davet linki</p>
              </div>
            ) : null}
          </div>

          {doc.elements.map((el) => (
            <RenderElement
              key={el.id}
              el={el}
              doc={doc}
              canvasWidth={canvasWidth}
              selected={selectedElementId === el.id}
              interactive={interactive}
              qrUrl={qrUrl}
              onSelect={() => onSelectElement?.(el.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
