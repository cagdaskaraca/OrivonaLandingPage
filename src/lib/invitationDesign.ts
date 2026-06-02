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
  const pick = (camel: string, pascal: string) => o[camel] ?? o[pascal];
  const num = (camel: string, pascal: string, fallback: number) => {
    const v = pick(camel, pascal);
    return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  };
  const str = (camel: string, pascal: string, fallback = "") => {
    const v = pick(camel, pascal);
    return typeof v === "string" ? v : fallback;
  };
  const imageRaw = pick("imageUrl", "ImageUrl");
  return {
    backgroundColor: str("backgroundColor", "BackgroundColor", "#1a0f2e"),
    title: str("title", "Title", "Davetlisiniz"),
    description: str("description", "Description", ""),
    dateText: str("dateText", "DateText", ""),
    textColor: str("textColor", "TextColor", "#f5f0ff"),
    fontSize: num("fontSize", "FontSize", 22),
    imageUrl:
      typeof imageRaw === "string"
        ? imageRaw
        : imageRaw === null
          ? null
          : undefined,
  };
}

/** Teklif kartında davetiye bloğu gösterilsin mi (kısmi API yanıtları dahil). */
export function hasInvitationDesignData(
  design?: InvitationDesign | null,
): boolean {
  if (!design || typeof design !== "object") return false;
  if (design.id != null) return true;
  if (design.title?.trim()) return true;
  if (design.fileUrl?.trim()) return true;
  if (design.previewUrl?.trim()) return true;
  if (design.designJson != null && design.designJson !== "") return true;
  return false;
}

export function hasInvitationPreviewContent(
  design: InvitationDesign,
): boolean {
  if (invitationDesignPreviewUrl(design)) return true;
  return parseInvitationEditorJson(design.designJson) != null;
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
  const preview =
    design.previewUrl?.trim() ||
    design.previewImageUrl?.trim() ||
    "";
  if (preview) return preview;
  const file = design.fileUrl?.trim();
  if (file && !(design.mimeType ?? "").toLowerCase().includes("pdf")) {
    return file;
  }
  const jsonImg = parseInvitationEditorJson(design.designJson)?.imageUrl;
  return jsonImg?.trim() || undefined;
}

export function invitationDesignFileUrl(
  design: InvitationDesign,
): string | undefined {
  return design.fileUrl?.trim() || undefined;
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
