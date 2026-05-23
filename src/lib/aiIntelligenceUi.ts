export const AI_INTELLIGENCE_LOADING =
  "ORIVONA Intelligence analiz ediyor...";

export const AI_PLANNER_TABS = [
  { id: "plan", label: "Plan Oluştur" },
  { id: "moodboard", label: "Moodboard" },
  { id: "budget", label: "Bütçe Optimizasyonu" },
  { id: "missing", label: "Eksik Hizmetler" },
  { id: "style", label: "Stil Eşleşmesi" },
  { id: "similar", label: "Benzer Etkinlikler" },
] as const;

export type AiPlannerTabId = (typeof AI_PLANNER_TABS)[number]["id"];

export function submitLabelForTab(tab: AiPlannerTabId): string {
  switch (tab) {
    case "plan":
      return "Plan Oluştur";
    case "moodboard":
      return "Moodboard oluştur";
    case "budget":
      return "Bütçeyi optimize et";
    case "missing":
      return "Eksikleri analiz et";
    case "style":
      return "Stil eşleşmesi bul";
    case "similar":
      return "Benzer etkinlikleri incele";
    default:
      return "Analiz et";
  }
}

export function marketplaceHrefForCategory(category: string): string {
  const params = new URLSearchParams();
  const name = category.trim();
  if (name) params.set("keyword", name);
  const q = params.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

export function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(
    value.trim(),
  );
}

export function formatTry(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} ₺`;
}
