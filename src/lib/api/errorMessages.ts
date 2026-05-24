import { ApiError } from "@/src/lib/api/client";
import { EMAIL_VERIFICATION_COMING_SOON } from "@/src/lib/authEmail";
import { isEmailNotVerifiedError } from "@/src/lib/authEmail";

export const LOGIN_WRONG_CREDENTIALS =
  "E-posta adresi veya şifre hatalı.";

export const ACCOUNT_DISABLED_MESSAGE =
  "Hesabınız devre dışı bırakılmış olabilir. Lütfen destek ile iletişime geçin.";

function readBodyStrings(body: unknown): string[] {
  if (!body) return [];
  if (typeof body === "string") return [body];
  if (typeof body !== "object") return [];
  const o = body as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of [
    "message",
    "Message",
    "title",
    "Title",
    "detail",
    "Detail",
    "code",
    "Code",
  ]) {
    if (o[key] != null) parts.push(String(o[key]));
  }
  return parts;
}

/** Combined API error text for classification. */
export function collectApiErrorText(err: ApiError): string {
  return [err.message, ...readBodyStrings(err.body)].filter(Boolean).join(" ");
}

export function isAccountDisabledError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const t = collectApiErrorText(err).toLowerCase();
  return (
    t.includes("account disabled") ||
    t.includes("account is disabled") ||
    t.includes("user is disabled") ||
    t.includes("user disabled") ||
    t.includes("deactivated") ||
    t.includes("inactive account") ||
    t.includes("account locked") ||
    t.includes("locked out") ||
    t.includes("devre dışı") ||
    t.includes("devre disi") ||
    t.includes("hesap devre") ||
    t.includes("hesabınız devre") ||
    t.includes("hesabiniz devre")
  );
}

/** Map raw English/technical lines to Turkish; return null to drop noise. */
export function humanizeApiLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (lower === "unauthorized" || lower === "forbidden") return null;
  if (lower === "yetkisiz erişim" || lower === "yetkisiz") return null;
  if (lower.includes("unauthorized") && lower.length < 24) return null;

  if (lower === "bad request") return "Geçersiz istek.";
  if (lower === "internal server error") {
    return "Sunucu hatası. Lütfen tekrar deneyin.";
  }

  if (
    lower.includes("title") &&
    (lower.includes("must not be empty") || lower.includes("boş olamaz"))
  ) {
    return "Başlık boş olamaz.";
  }

  if (lower.includes("must not be empty")) {
    const field = trimmed.split(":")[0]?.replace(/['"]/g, "").trim();
    if (field && field.toLowerCase() !== "title") {
      return `${field} alanı boş olamaz.`;
    }
    return "Zorunlu alanlar doldurulmalıdır.";
  }

  if (lower.includes("invalid email") || lower.includes("geçersiz e-posta")) {
    return "Geçerli bir e-posta adresi giriniz.";
  }

  if (lower.includes("phone") && lower.includes("invalid")) {
    return "Geçerli bir telefon numarası giriniz.";
  }

  return trimmed;
}

export function formatLoginError(
  err: unknown,
  fallback = LOGIN_WRONG_CREDENTIALS,
): string {
  if (isAccountDisabledError(err)) {
    return ACCOUNT_DISABLED_MESSAGE;
  }

  if (isEmailNotVerifiedError(err)) {
    return EMAIL_VERIFICATION_COMING_SOON;
  }

  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return LOGIN_WRONG_CREDENTIALS;
    }

    const combined = collectApiErrorText(err).toLowerCase();
    if (
      combined.includes("unauthorized") ||
      combined.includes("yetkisiz") ||
      combined.includes("invalid credentials") ||
      combined.includes("wrong password") ||
      combined.includes("hatalı şifre") ||
      combined.includes("hatali sifre")
    ) {
      return LOGIN_WRONG_CREDENTIALS;
    }
  }

  const fromApi = humanizeKnownApiError(err, fallback);
  if (/unauthorized|yetkisiz/i.test(fromApi)) {
    return LOGIN_WRONG_CREDENTIALS;
  }
  return fromApi;
}

/** User-facing message from ApiError with Turkish polish. */
export function humanizeKnownApiError(
  err: unknown,
  fallback: string,
): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error && err.message.trim()
      ? err.message
      : fallback;
  }

  const lines: string[] = [];
  if (err.message) {
    const h = humanizeApiLine(err.message);
    if (h) lines.push(h);
  }

  const body = err.body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const errors = record.errors;
    if (errors && typeof errors === "object" && !Array.isArray(errors)) {
      for (const [field, value] of Object.entries(
        errors as Record<string, unknown>,
      )) {
        const msgs = Array.isArray(value)
          ? value.map(String)
          : [String(value)];
        for (const msg of msgs) {
          const h = humanizeApiLine(`${field}: ${msg}`) ?? humanizeApiLine(msg);
          if (h) lines.push(h);
        }
      }
    } else {
      for (const part of readBodyStrings(body)) {
        const h = humanizeApiLine(part);
        if (h) lines.push(h);
      }
    }
  }

  const unique = [...new Set(lines.filter(Boolean))];
  return unique.length > 0 ? unique.join("\n") : fallback;
}
