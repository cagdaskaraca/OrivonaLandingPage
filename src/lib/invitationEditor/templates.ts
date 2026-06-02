import type {
  InvitationEditorDocument,
  InvitationFontId,
  InvitationTemplateId,
} from "@/src/lib/invitationEditor/types";

export type InvitationTemplateDef = {
  id: InvitationTemplateId;
  name: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: InvitationFontId;
  borderClass: string;
  overlayClass: string;
  ornament?: string;
};

export const INVITATION_TEMPLATES: InvitationTemplateDef[] = [
  {
    id: "classic",
    name: "Klasik",
    backgroundColor: "#faf7f2",
    accentColor: "#8b6914",
    textColor: "#2c2416",
    fontFamily: "playfair",
    borderClass: "border-[3px] border-double border-[#8b6914]/70",
    overlayClass: "bg-gradient-to-b from-[#faf7f2] via-[#f5efe6] to-[#ebe3d6]",
    ornament: "❦",
  },
  {
    id: "modern",
    name: "Modern",
    backgroundColor: "#0f0f12",
    accentColor: "#a78bfa",
    textColor: "#f4f4f5",
    fontFamily: "montserrat",
    borderClass: "border border-violet-400/40",
    overlayClass: "bg-gradient-to-br from-[#18181b] via-[#0f0f12] to-[#1e1b2e]",
  },
  {
    id: "minimal",
    name: "Minimal",
    backgroundColor: "#ffffff",
    accentColor: "#52525b",
    textColor: "#18181b",
    fontFamily: "poppins",
    borderClass: "border border-zinc-200",
    overlayClass: "bg-white",
  },
  {
    id: "floral",
    name: "Floral",
    backgroundColor: "#fff8f5",
    accentColor: "#be5a7a",
    textColor: "#4a2c3a",
    fontFamily: "greatVibes",
    borderClass: "border-2 border-[#be5a7a]/35",
    overlayClass:
      "bg-[radial-gradient(ellipse_at_top,_#ffe8ef_0%,_#fff8f5_45%,_#f5ebe8_100%)]",
    ornament: "🌸",
  },
  {
    id: "gold",
    name: "Altın Çerçeveli",
    backgroundColor: "#1a1208",
    accentColor: "#d4af37",
    textColor: "#f5ecd7",
    fontFamily: "cinzel",
    borderClass: "border-[3px] border-[#d4af37]/80 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]",
    overlayClass:
      "bg-gradient-to-b from-[#2a1f0e] via-[#1a1208] to-[#0d0904]",
    ornament: "✦",
  },
  {
    id: "purplePremium",
    name: "Mor Premium",
    backgroundColor: "#0a0612",
    accentColor: "#c4b5fd",
    textColor: "#f5f0ff",
    fontFamily: "playfair",
    borderClass: "border border-violet-400/50",
    overlayClass:
      "bg-gradient-to-br from-[#1a0f2e] via-[#0a0612] to-[#12081f]",
    ornament: "◆",
  },
];

export function getTemplate(id: InvitationTemplateId): InvitationTemplateDef {
  return (
    INVITATION_TEMPLATES.find((t) => t.id === id) ?? INVITATION_TEMPLATES[0]
  );
}

export function applyTemplateToDocument(
  doc: InvitationEditorDocument,
  templateId: InvitationTemplateId,
): InvitationEditorDocument {
  const t = getTemplate(templateId);
  return {
    ...doc,
    templateId,
    backgroundColor: t.backgroundColor,
    accentColor: t.accentColor,
    textColor: t.textColor,
    fontFamily: t.fontFamily,
  };
}
