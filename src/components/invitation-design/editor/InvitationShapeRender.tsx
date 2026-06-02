"use client";

import { Heart, Star } from "lucide-react";
import { resolveShapeType } from "@/src/lib/invitationEditor/shapes";
import type {
  InvitationEditorDocument,
  LayoutElement,
} from "@/src/lib/invitationEditor/types";

type InvitationShapeRenderProps = {
  el: LayoutElement;
  doc: InvitationEditorDocument;
};

export function InvitationShapeRender({ el, doc }: InvitationShapeRenderProps) {
  const shapeType = resolveShapeType(el);
  const fill = el.fill ?? doc.accentColor;
  const stroke = el.stroke ?? doc.textColor;
  const strokeWidth = el.strokeWidth ?? 2;
  const opacity = el.opacity ?? 0.75;

  if (shapeType === "line" || shapeType === "divider") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundColor: fill,
          opacity,
          borderRadius: shapeType === "divider" ? 2 : 0,
          height: shapeType === "divider" ? Math.max(2, el.height) : "100%",
          marginTop: shapeType === "line" ? "auto" : 0,
          marginBottom: shapeType === "line" ? "auto" : 0,
        }}
      />
    );
  }

  if (shapeType === "frame") {
    return (
      <div
        className="h-full w-full box-border"
        style={{
          border: `${strokeWidth}px solid ${stroke}`,
          backgroundColor: "transparent",
          opacity,
          borderRadius: 4,
        }}
      />
    );
  }

  if (shapeType === "badge") {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: fill,
          color: stroke,
          opacity,
          borderRadius: 9999,
          border: `1px solid ${stroke}`,
        }}
      >
        Davet
      </div>
    );
  }

  if (shapeType === "heart") {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ opacity }}>
        <Heart
          className="h-full w-full"
          fill={fill}
          color={fill}
          strokeWidth={1}
        />
      </div>
    );
  }

  if (shapeType === "star") {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ opacity }}>
        <Star className="h-full w-full" fill={fill} color={fill} strokeWidth={1} />
      </div>
    );
  }

  const borderRadius =
    shapeType === "circle" || shapeType === "oval"
      ? "9999px"
      : shapeType === "square"
        ? 4
        : 8;

  return (
    <div
      className="h-full w-full box-border"
      style={{
        backgroundColor: fill,
        opacity,
        borderRadius,
        border:
          strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : undefined,
      }}
    />
  );
}
