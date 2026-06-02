import type { InvitationDesign, InvitationEditorJson } from "@/src/lib/api/types";

export const INVITATION_CATEGORY_KEYWORDS = [
  "davetiye",
  "invitation",
] as const;

export function isInvitationCategory(value?: string | null): boolean {
  if (!value?.trim()) return false;
  const n = value.trim().toLowerCase();
  return INVITATION_CATEGORY_KEYWORDS.some((k) => n.includes(k));
}

export function defaultInvitationEditorJson(): InvitationEditorJson {
  return {
    backgroundColor: "#1a0f2e",
    title: "Davetlisiniz",
    description: "Sizleri aramızda görmekten mutluluk duyarız.",
    dateText: "",
    textColor: "#f5f0ff",
    fontSize: 22,
    imageUrl: null,
  };
}

export function parseInvitationEditorJson(
  raw: unknown,
): InvitationEditorJson | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return parseInvitationEditorJson(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (k: string, fallback: number) => {
    const v = o[k];
    return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  };
  const str = (k: string, fallback = "") => {
    const v = o[k];
    return typeof v === "string" ? v : fallback;
  };
  return {
    backgroundColor: str("backgroundColor", "#1a0f2e"),
    title: str("title", "Davetlisiniz"),
    description: str("description", ""),
    dateText: str("dateText", ""),
    textColor: str("textColor", "#f5f0ff"),
    fontSize: num("fontSize", 22),
    imageUrl:
      typeof o.imageUrl === "string"
        ? o.imageUrl
        : o.imageUrl === null
          ? null
          : undefined,
  };
}

export function invitationDesignTitle(design: InvitationDesign): string {
  return (
    design.title?.trim() ||
    (design.sourceType === "Upload" ? "Yüklenen dosya" : "Davetiye tasarımı")
  );
}

export function invitationDesignPreviewUrl(
  design: InvitationDesign,
): string | undefined {
  return (
    design.previewUrl?.trim() ||
    design.fileUrl?.trim() ||
    parseInvitationEditorJson(design.designJson)?.imageUrl ||
    undefined
  );
}

export function invitationDesignStatusLabel(status?: string): string {
  const s = (status ?? "Draft").trim();
  const map: Record<string, string> = {
    Draft: "Taslak",
    Ready: "Hazır",
    Published: "Yayında",
    Attached: "Talebe bağlı",
  };
  return map[s] ?? s;
}
