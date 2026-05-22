export type CategoryPlaceholder = {
  label: string;
  icon: string;
  gradient: string;
  pattern: string;
};

const PLACEHOLDERS: Record<string, CategoryPlaceholder> = {
  Mekan: {
    label: "Mekan",
    icon: "🏛️",
    gradient: "from-violet-700/50 via-purple-900/40 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 30% 20%, rgba(167,139,250,0.25), transparent 50%)",
  },
  Gelinlik: {
    label: "Gelinlik",
    icon: "👗",
    gradient: "from-fuchsia-800/45 via-violet-900/35 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 70% 30%, rgba(236,72,153,0.2), transparent 55%)",
  },
  Davetiye: {
    label: "Davetiye",
    icon: "💌",
    gradient: "from-indigo-800/40 via-violet-950/50 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 50% 80%, rgba(129,140,248,0.18), transparent 45%)",
  },
  Fotoğrafçı: {
    label: "Fotoğrafçı",
    icon: "📷",
    gradient: "from-slate-800/50 via-violet-900/40 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 20% 60%, rgba(148,163,184,0.15), transparent 50%)",
  },
  Catering: {
    label: "Catering",
    icon: "🍽️",
    gradient: "from-amber-900/35 via-violet-950/45 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 80% 40%, rgba(245,158,11,0.15), transparent 50%)",
  },
  Müzik: {
    label: "Müzik",
    icon: "🎵",
    gradient: "from-blue-900/40 via-purple-950/50 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 40% 50%, rgba(59,130,246,0.2), transparent 55%)",
  },
  Dekorasyon: {
    label: "Dekorasyon",
    icon: "✨",
    gradient: "from-pink-900/35 via-violet-950/45 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 60% 20%, rgba(244,114,182,0.18), transparent 50%)",
  },
  "Organizasyon Planlayıcı": {
    label: "Organizasyon Planlayıcı",
    icon: "📋",
    gradient: "from-violet-800/45 via-indigo-950/50 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.22), transparent 60%)",
  },
  "Saç Makyaj": {
    label: "Saç Makyaj",
    icon: "💄",
    gradient: "from-rose-900/35 via-violet-950/45 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 25% 35%, rgba(251,113,133,0.2), transparent 50%)",
  },
  Ulaşım: {
    label: "Ulaşım",
    icon: "🚗",
    gradient: "from-zinc-800/50 via-violet-950/40 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 75% 70%, rgba(161,161,170,0.12), transparent 45%)",
  },
  Pasta: {
    label: "Pasta",
    icon: "🎂",
    gradient: "from-pink-800/30 via-violet-950/50 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 50% 30%, rgba(251,207,232,0.15), transparent 55%)",
  },
  "Nikah Şekeri": {
    label: "Nikah Şekeri",
    icon: "🍬",
    gradient: "from-rose-800/35 via-fuchsia-950/45 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 40% 70%, rgba(225,29,72,0.12), transparent 50%)",
  },
};

const NORMALIZE_MAP: Record<string, string> = {
  mekan: "Mekan",
  gelinlik: "Gelinlik",
  davetiye: "Davetiye",
  fotografci: "Fotoğrafçı",
  fotoğrafçı: "Fotoğrafçı",
  catering: "Catering",
  muzik: "Müzik",
  müzik: "Müzik",
  dekorasyon: "Dekorasyon",
  "organizasyon planlayici": "Organizasyon Planlayıcı",
  "organizasyon planlayıcı": "Organizasyon Planlayıcı",
  "sac makyaj": "Saç Makyaj",
  "saç makyaj": "Saç Makyaj",
  ulasim: "Ulaşım",
  ulaşım: "Ulaşım",
  pasta: "Pasta",
  "nikah sekeri": "Nikah Şekeri",
  "nikah şekeri": "Nikah Şekeri",
};

function normalizeCategoryKey(name: string): string {
  const trimmed = name.trim();
  if (PLACEHOLDERS[trimmed]) return trimmed;
  const lower = trimmed.toLocaleLowerCase("tr-TR");
  if (NORMALIZE_MAP[lower]) return NORMALIZE_MAP[lower];
  return trimmed;
}

export function getCategoryPlaceholder(
  categoryName?: string | null,
): CategoryPlaceholder {
  const fallback: CategoryPlaceholder = {
    label: "Hizmet",
    icon: "✦",
    gradient: "from-violet-800/40 via-purple-950/50 to-[#0a0612]",
    pattern:
      "radial-gradient(circle at 50% 40%, rgba(167,139,250,0.2), transparent 55%)",
  };
  if (!categoryName?.trim()) return fallback;
  const key = normalizeCategoryKey(categoryName);
  return PLACEHOLDERS[key] ?? { ...fallback, label: categoryName.trim() };
}
