export type PasswordCriterionKey =
  | "length"
  | "upper"
  | "lower"
  | "digit"
  | "special";

export type PasswordCriterion = {
  key: PasswordCriterionKey;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_CRITERIA: PasswordCriterion[] = [
  {
    key: "length",
    label: "En az 8 karakter",
    test: (password) => password.length >= 8,
  },
  {
    key: "upper",
    label: "Büyük harf içeriyor",
    test: (password) => /[A-ZÇĞİÖŞÜ]/.test(password),
  },
  {
    key: "lower",
    label: "Küçük harf içeriyor",
    test: (password) => /[a-zçğıöşü]/.test(password),
  },
  {
    key: "digit",
    label: "Rakam içeriyor",
    test: (password) => /\d/.test(password),
  },
  {
    key: "special",
    label: "Özel karakter içeriyor",
    test: (password) => /[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(password),
  },
];

export type PasswordStrength = "weak" | "medium" | "strong";

export const PASSWORD_STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: "Zayıf",
  medium: "Orta",
  strong: "Güçlü",
};

export const PASSWORDS_MISMATCH_MESSAGE = "Şifreler eşleşmiyor.";

export function evaluatePasswordCriteria(password: string) {
  return PASSWORD_CRITERIA.map((criterion) => ({
    ...criterion,
    met: criterion.test(password),
  }));
}

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  const metCount = PASSWORD_CRITERIA.filter((c) => c.test(password)).length;
  if (metCount <= 2) return "weak";
  if (metCount <= 4) return "medium";
  return "strong";
}

export function isPasswordPolicyMet(password: string): boolean {
  return PASSWORD_CRITERIA.every((c) => c.test(password));
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
