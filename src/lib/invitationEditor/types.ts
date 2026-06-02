/** Davetiye editörü v2+ — designJson içinde saklanır; API değişmez. */

export type InvitationTemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "floral"
  | "gold"
  | "purplePremium";

export type InvitationFontId =
  | "playfair"
  | "greatVibes"
  | "cinzel"
  | "montserrat"
  | "poppins";

export type PreviewViewport = "a4" | "mobile";

export type TextAlign = "left" | "center" | "right";

export type QrLinkSource = "invite" | "publicPage";

export type ShapeType =
  | "circle"
  | "square"
  | "rectangle"
  | "line"
  | "heart"
  | "star"
  | "oval"
  | "divider"
  | "frame"
  | "badge";

export type InvitationFormFields = {
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  notes: string;
};

export type LayoutElementType =
  | "title"
  | "description"
  | "date"
  | "image"
  | "qr"
  | "text"
  | "shape"
  | "icon";

export type LayoutElement = {
  id: string;
  type: LayoutElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  rotation?: number;
  hidden?: boolean;
  content?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: InvitationFontId;
  bold?: boolean;
  italic?: boolean;
  align?: TextAlign;
  url?: string;
  /** @deprecated shapeType kullanın */
  shape?: "rect" | "circle";
  shapeType?: ShapeType;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  icon?: "heart" | "rings" | "star" | "flower";
};

export type InvitationLayoutJson = {
  canvasWidth: number;
  canvasHeight: number;
  elements: LayoutElement[];
};

export type EditorTextElement = {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  fontFamily: InvitationFontId;
  bold: boolean;
  italic: boolean;
  align: TextAlign;
};

export type EditorImageElement = {
  id: string;
  type: "image";
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EditorShapeElement = {
  id: string;
  type: "shape";
  shape: "rect" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
};

export type EditorIconElement = {
  id: string;
  type: "icon";
  icon: "heart" | "rings" | "star" | "flower";
  x: number;
  y: number;
  size: number;
  color: string;
};

export type EditorQrElement = {
  id: string;
  type: "qr";
  x: number;
  y: number;
  size: number;
};

export type EditorElement =
  | EditorTextElement
  | EditorImageElement
  | EditorShapeElement
  | EditorIconElement
  | EditorQrElement;

export type InvitationEditorDocument = {
  version: 2;
  templateId: InvitationTemplateId;
  fontFamily: InvitationFontId;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  title: string;
  description: string;
  dateText: string;
  fontSize: number;
  imageUrl?: string | null;
  fields: InvitationFormFields;
  layoutJson: InvitationLayoutJson;
  /** Kayıtta layoutJson.elements ile senkron */
  elements: LayoutElement[];
  qr: {
    enabled: boolean;
    source: QrLinkSource;
    customUrl?: string;
  };
};

export type InvitationQrUrls = {
  inviteUrl?: string;
  publicPageUrl?: string;
};
