export const EMAIL_INVALID_MESSAGE = "Geçerli bir e-posta adresi giriniz.";
export const PHONE_INVALID_MESSAGE = "Geçerli bir telefon numarası giriniz.";

/** Requires at least one dot in domain and TLD length >= 2 (e.g. .com, .com.tr). */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

export type PhoneCountryOption = {
  code: string;
  dial: string;
  label: string;
};

export const PHONE_COUNTRIES: PhoneCountryOption[] = [
  { code: "TR", dial: "90", label: "Türkiye" },
  { code: "US", dial: "1", label: "ABD" },
  { code: "GB", dial: "44", label: "Birleşik Krallık" },
  { code: "DE", dial: "49", label: "Almanya" },
];

export const DEFAULT_PHONE_COUNTRY = "TR";

export function getPhoneCountry(code: string): PhoneCountryOption {
  return (
    PHONE_COUNTRIES.find((c) => c.code === code) ??
    PHONE_COUNTRIES[0]!
  );
}

export function isValidEmail(email: string): boolean {
  const v = email.trim();
  if (!v) return false;
  if (!EMAIL_PATTERN.test(v)) return false;
  const domain = v.split("@")[1];
  if (!domain || domain.endsWith(".")) return false;
  return true;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Strip dial code / leading zero from pasted or typed input (local digits only). */
export function normalizeNationalDigits(
  countryCode: string,
  raw: string,
): string {
  let digits = digitsOnly(raw);
  const maxLen = countryCode === "TR" ? 10 : 15;

  if (countryCode === "TR") {
    if (digits.startsWith("90") && digits.length > 10) {
      digits = digits.slice(2);
    }
    if (digits.startsWith("0") && digits.length >= 10) {
      digits = digits.slice(1);
    }
  }

  return digits.slice(0, maxLen);
}

/** Turkish mobile display: 5XX XXX XX XX */
export function formatTrNationalDisplay(digits: string): string {
  const d = digitsOnly(digits).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export function parseStoredPhone(value?: string | null): {
  countryCode: string;
  nationalDigits: string;
} {
  const raw = (value ?? "").trim();
  if (!raw) {
    return { countryCode: DEFAULT_PHONE_COUNTRY, nationalDigits: "" };
  }

  if (raw.startsWith("+")) {
    const sorted = [...PHONE_COUNTRIES].sort(
      (a, b) => b.dial.length - a.dial.length,
    );
    for (const c of sorted) {
      const prefix = `+${c.dial}`;
      if (raw.startsWith(prefix)) {
        return {
          countryCode: c.code,
          nationalDigits: digitsOnly(raw.slice(prefix.length)),
        };
      }
    }
  }

  let digits = digitsOnly(raw);
  if (digits.startsWith("90") && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  return {
    countryCode: DEFAULT_PHONE_COUNTRY,
    nationalDigits: digits.slice(0, 15),
  };
}

export function toE164Phone(
  countryCode: string,
  nationalDigits: string,
): string {
  const digits = digitsOnly(nationalDigits);
  if (!digits) return "";
  const country = getPhoneCountry(countryCode);
  return `+${country.dial}${digits}`;
}

export function validatePhone(
  countryCode: string,
  nationalDigits: string,
  required = false,
): { valid: boolean; message?: string } {
  const digits = normalizeNationalDigits(countryCode, nationalDigits);
  if (!digits) {
    return required
      ? { valid: false, message: PHONE_INVALID_MESSAGE }
      : { valid: true };
  }

  if (countryCode === "TR") {
    if (digits.length !== 10) {
      return { valid: false, message: PHONE_INVALID_MESSAGE };
    }
    if (!digits.startsWith("5")) {
      return { valid: false, message: PHONE_INVALID_MESSAGE };
    }
    return { valid: true };
  }

  if (digits.length < 6 || digits.length > 15) {
    return { valid: false, message: PHONE_INVALID_MESSAGE };
  }
  return { valid: true };
}

export function isValidStoredPhone(
  value: string | undefined | null,
  required = false,
): boolean {
  const { countryCode, nationalDigits } = parseStoredPhone(value);
  return validatePhone(countryCode, nationalDigits, required).valid;
}

export function formatNationalDisplay(
  countryCode: string,
  nationalDigits: string,
): string {
  if (countryCode === "TR") {
    return formatTrNationalDisplay(nationalDigits);
  }
  return digitsOnly(nationalDigits).slice(0, 15);
}
