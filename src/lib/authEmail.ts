import { ApiError, apiPostPublic, apiPostPublicRaw } from "@/src/lib/api/client";
import type { ApiEnvelope } from "@/src/lib/api/types";

export const FORGOT_PASSWORD_COMING_SOON =
  "Şifre sıfırlama altyapısı yakında aktif edilecektir.";

export const EMAIL_VERIFICATION_COMING_SOON =
  "E-posta doğrulama altyapısı yakında aktif edilecek. Lütfen daha sonra tekrar deneyin.";

export async function verifyEmail(payload: {
  email: string;
  code: string;
}): Promise<void> {
  await apiPostPublic<unknown>("/auth/verify-email", {
    email: payload.email.trim(),
    code: payload.code.trim(),
  });
}

export async function sendEmailVerification(email: string): Promise<void> {
  await apiPostPublic<unknown>("/auth/send-email-verification", {
    email: email.trim(),
  });
}

function messageFromForgotPasswordBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  for (const key of ["message", "Message"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Calls POST /auth/forgot-password; returns backend message or placeholder. */
export async function requestForgotPassword(email: string): Promise<string> {
  try {
    const body = await apiPostPublicRaw<ApiEnvelope>("/auth/forgot-password", {
      email: email.trim(),
    });
    return messageFromForgotPasswordBody(body) ?? FORGOT_PASSWORD_COMING_SOON;
  } catch (err) {
    if (err instanceof ApiError) {
      const fromBody = messageFromForgotPasswordBody(err.body);
      if (fromBody) return fromBody;
    }
    return FORGOT_PASSWORD_COMING_SOON;
  }
}

export function isEmailNotVerifiedError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;

  const parts: string[] = [err.message];
  const body = err.body;
  if (typeof body === "string") parts.push(body);
  else if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    for (const key of ["message", "Message", "title", "Title", "code", "Code"]) {
      if (o[key] != null) parts.push(String(o[key]));
    }
  }

  const combined = parts.join(" ").toLowerCase();
  return (
    combined.includes("emailnotconfirmed") ||
    combined.includes("email_not_confirmed") ||
    combined.includes("email_not_verified") ||
    combined.includes("email is not confirmed") ||
    combined.includes("email not confirmed") ||
    combined.includes("e-posta doğrulanmamış") ||
    combined.includes("e-posta dogrulanmamis") ||
    combined.includes("eposta doğrulanmamış") ||
    combined.includes("eposta dogrulanmamis")
  );
}
