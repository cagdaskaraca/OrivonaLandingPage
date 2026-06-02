import type { InvitationFontId } from "@/src/lib/invitationEditor/types";

export const INVITATION_FONT_OPTIONS: {
  id: InvitationFontId;
  label: string;
  cssFamily: string;
}[] = [
  {
    id: "playfair",
    label: "Playfair Display",
    cssFamily: "var(--font-inv-playfair), Georgia, serif",
  },
  {
    id: "greatVibes",
    label: "Great Vibes",
    cssFamily: "var(--font-inv-great-vibes), cursive",
  },
  {
    id: "cinzel",
    label: "Cinzel",
    cssFamily: "var(--font-inv-cinzel), serif",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    cssFamily: "var(--font-inv-montserrat), sans-serif",
  },
  {
    id: "poppins",
    label: "Poppins",
    cssFamily: "var(--font-inv-poppins), sans-serif",
  },
];

export function fontCssFamily(id: InvitationFontId): string {
  return (
    INVITATION_FONT_OPTIONS.find((f) => f.id === id)?.cssFamily ??
    INVITATION_FONT_OPTIONS[0].cssFamily
  );
}
