export const VENDOR_COMPANY_TYPES = [
  { value: "Sahis", label: "Şahıs" },
  { value: "Limited", label: "Limited" },
  { value: "Anonim", label: "Anonim" },
  { value: "Diger", label: "Diğer" },
] as const;

export type VendorCompanyType = (typeof VENDOR_COMPANY_TYPES)[number]["value"];

export const VENDOR_IDENTITY_UX_NOTE =
  "Bu bilgiler işletme doğrulama süreci için alınır. Vergi/T.C. doğrulama entegrasyonu ilerleyen aşamada aktif edilecektir.";

export function companyTypeLabel(value?: string | null): string {
  if (!value?.trim()) return "—";
  const found = VENDOR_COMPANY_TYPES.find(
    (t) => t.value.toLowerCase() === value.trim().toLowerCase(),
  );
  return found?.label ?? value;
}

export function maskSensitiveNumber(value?: string | null): string {
  if (!value?.trim()) return "—";
  const v = value.trim().replace(/\s/g, "");
  if (v.length <= 4) return "••••";
  return "•".repeat(Math.max(4, v.length - 4)) + v.slice(-4);
}

export type IdentityVerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | string;

export function identityVerificationLabel(status?: string | null): string {
  if (!status?.trim()) return "Bekliyor";
  const s = status.trim().toLowerCase();
  if (s.includes("verified") || s.includes("doğruland") || s.includes("approved"))
    return "Doğrulandı";
  if (s.includes("reject") || s.includes("red")) return "Reddedildi";
  if (s.includes("pending") || s.includes("bekl")) return "Bekliyor";
  return status;
}

export function identityVerificationClass(status?: string | null): string {
  const label = identityVerificationLabel(status);
  if (label === "Doğrulandı")
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";
  if (label === "Reddedildi")
    return "border-red-400/30 bg-red-500/15 text-red-200";
  return "border-amber-400/30 bg-amber-500/15 text-amber-100";
}
