export function recordStr(
  o: Record<string, unknown>,
  key: string,
  alt?: string,
): string | undefined {
  const v = o[key] ?? (alt ? o[alt] : undefined);
  return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
}

export function recordNum(
  o: Record<string, unknown>,
  key: string,
  alt?: string,
): number | undefined {
  const v = o[key] ?? (alt ? o[alt] : undefined);
  return typeof v === "number" ? v : undefined;
}

export function recordBool(
  o: Record<string, unknown>,
  key: string,
  alt?: string,
): boolean | undefined {
  const v = o[key] ?? (alt ? o[alt] : undefined);
  if (typeof v === "boolean") return v;
  return undefined;
}

export function recordId(
  o: Record<string, unknown>,
  key = "id",
  alt = "Id",
): string | number | undefined {
  const v = o[key] ?? o[alt];
  if (typeof v === "string" || typeof v === "number") return v;
  return undefined;
}
