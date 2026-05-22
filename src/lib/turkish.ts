/** Trim and fold Turkish characters for loose client-side matching hints. */
export function normalizeTurkishText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i");
}

/** Sends city to API with consistent casing (backend may still normalize İzmir/Izmir). */
export function formatCityForApi(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLocaleLowerCase("tr-TR");
  if (lower === "izmir") return "İzmir";
  if (lower === "istanbul" || lower === "i̇stanbul") return "İstanbul";
  if (lower === "ankara") return "Ankara";
  return trimmed.charAt(0).toLocaleUpperCase("tr-TR") + trimmed.slice(1);
}
