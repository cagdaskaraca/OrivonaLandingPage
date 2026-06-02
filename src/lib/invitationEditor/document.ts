import { parseInvitationEditorJson } from "@/src/lib/invitationDesign";
import type { InvitationEditorJson } from "@/src/lib/api/types";
import { applyTemplateToDocument } from "@/src/lib/invitationEditor/templates";
import type {
  EditorElement,
  InvitationEditorDocument,
  InvitationFontId,
  InvitationFormFields,
  InvitationTemplateId,
  QrLinkSource,
} from "@/src/lib/invitationEditor/types";

export function defaultFormFields(): InvitationFormFields {
  return {
    brideName: "",
    groomName: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    notes: "",
  };
}

export function defaultInvitationDocument(): InvitationEditorDocument {
  const base = applyTemplateToDocument(
    {
      version: 2,
      templateId: "purplePremium",
      fontFamily: "playfair",
      backgroundColor: "#0a0612",
      accentColor: "#c4b5fd",
      textColor: "#f5f0ff",
      title: "Davetlisiniz",
      description: "Sizleri aramızda görmekten mutluluk duyarız.",
      dateText: "",
      fontSize: 22,
      imageUrl: null,
      fields: defaultFormFields(),
      elements: [],
      qr: { enabled: false, source: "invite" },
    },
    "purplePremium",
  );
  return syncLegacyTextFields(base);
}

function strField(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function pickTemplateId(raw: unknown): InvitationTemplateId {
  const s = typeof raw === "string" ? raw : "";
  const ids: InvitationTemplateId[] = [
    "classic",
    "modern",
    "minimal",
    "floral",
    "gold",
    "purplePremium",
  ];
  return ids.includes(s as InvitationTemplateId)
    ? (s as InvitationTemplateId)
    : "purplePremium";
}

function pickFontId(raw: unknown): InvitationFontId {
  const s = typeof raw === "string" ? raw : "";
  const ids: InvitationFontId[] = [
    "playfair",
    "greatVibes",
    "cinzel",
    "montserrat",
    "poppins",
  ];
  return ids.includes(s as InvitationFontId) ? (s as InvitationFontId) : "playfair";
}

function normalizeElements(raw: unknown): EditorElement[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((el) => el && typeof el === "object") as EditorElement[];
}

export function syncLegacyTextFields(
  doc: InvitationEditorDocument,
): InvitationEditorDocument {
  const { brideName, groomName, date, time, venue, address, notes } = doc.fields;
  const names = [brideName, groomName].filter(Boolean).join(" & ");
  const title = names || doc.title || "Davetlisiniz";
  const dateParts = [date, time].filter(Boolean);
  const dateText =
    dateParts.length > 0 ? dateParts.join(" · ") : doc.dateText;
  const descParts = [venue, address, notes].filter(Boolean);
  const description =
    descParts.length > 0 ? descParts.join("\n") : doc.description;
  return { ...doc, title, dateText, description };
}

export function parseInvitationDocument(raw: unknown): InvitationEditorDocument {
  if (!raw) return defaultInvitationDocument();
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return defaultInvitationDocument();
    }
  }
  if (typeof parsed !== "object" || !parsed) return defaultInvitationDocument();
  const o = parsed as Record<string, unknown>;

  if (o.version === 2) {
    const fieldsRaw =
      o.fields && typeof o.fields === "object"
        ? (o.fields as Record<string, unknown>)
        : {};
    const qrRaw =
      o.qr && typeof o.qr === "object" ? (o.qr as Record<string, unknown>) : {};
    const doc: InvitationEditorDocument = {
      version: 2,
      templateId: pickTemplateId(o.templateId),
      fontFamily: pickFontId(o.fontFamily),
      backgroundColor: strField(o, "backgroundColor", "BackgroundColor") || "#0a0612",
      accentColor: strField(o, "accentColor", "AccentColor") || "#c4b5fd",
      textColor: strField(o, "textColor", "TextColor") || "#f5f0ff",
      title: strField(o, "title", "Title") || "Davetlisiniz",
      description: strField(o, "description", "Description"),
      dateText: strField(o, "dateText", "DateText"),
      fontSize:
        typeof o.fontSize === "number" && !Number.isNaN(o.fontSize)
          ? o.fontSize
          : 22,
      imageUrl:
        typeof o.imageUrl === "string"
          ? o.imageUrl
          : o.imageUrl === null
            ? null
            : null,
      fields: {
        brideName: strField(fieldsRaw, "brideName", "BrideName"),
        groomName: strField(fieldsRaw, "groomName", "GroomName"),
        date: strField(fieldsRaw, "date", "Date"),
        time: strField(fieldsRaw, "time", "Time"),
        venue: strField(fieldsRaw, "venue", "Venue"),
        address: strField(fieldsRaw, "address", "Address"),
        notes: strField(fieldsRaw, "notes", "Notes"),
      },
      elements: normalizeElements(o.elements),
      qr: {
        enabled: qrRaw.enabled === true,
        source:
          qrRaw.source === "publicPage" ? "publicPage" : ("invite" as QrLinkSource),
        customUrl: strField(qrRaw, "customUrl", "CustomUrl") || undefined,
      },
    };
    return syncLegacyTextFields(doc);
  }

  const legacy = parseInvitationEditorJson(o);
  if (!legacy) return defaultInvitationDocument();
  return legacyToDocument(legacy);
}

export function legacyToDocument(
  legacy: InvitationEditorJson,
): InvitationEditorDocument {
  const doc = defaultInvitationDocument();
  return syncLegacyTextFields({
    ...doc,
    backgroundColor: legacy.backgroundColor,
    textColor: legacy.textColor,
    title: legacy.title,
    description: legacy.description,
    dateText: legacy.dateText,
    fontSize: legacy.fontSize,
    imageUrl: legacy.imageUrl ?? null,
    fields: {
      ...defaultFormFields(),
      notes: legacy.description,
      date: legacy.dateText,
    },
  });
}

export function documentToLegacyJson(
  doc: InvitationEditorDocument,
): InvitationEditorJson {
  const synced = syncLegacyTextFields(doc);
  return {
    backgroundColor: synced.backgroundColor,
    title: synced.title,
    description: synced.description,
    dateText: synced.dateText,
    textColor: synced.textColor,
    fontSize: synced.fontSize,
    imageUrl: synced.imageUrl ?? null,
  };
}

export function newElementId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveQrUrl(
  doc: InvitationEditorDocument,
  urls: { inviteUrl?: string; publicPageUrl?: string },
): string {
  if (doc.qr.customUrl?.trim()) return doc.qr.customUrl.trim();
  if (doc.qr.source === "publicPage" && urls.publicPageUrl?.trim()) {
    return urls.publicPageUrl.trim();
  }
  if (urls.inviteUrl?.trim()) return urls.inviteUrl.trim();
  if (urls.publicPageUrl?.trim()) return urls.publicPageUrl.trim();
  return typeof window !== "undefined"
    ? `${window.location.origin}/`
    : "https://orivona.com";
}
