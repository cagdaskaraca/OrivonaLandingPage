import { OBOT_FLOWS } from "@/src/lib/obot/flows";
import { OBOT_ACTIONS } from "@/src/lib/obot/actions";
import { OBOT_QUICK_QUESTIONS } from "@/src/lib/obot/suggestedQuestions";
import type { HelpAssistantRole, OBotReply } from "@/src/lib/obot/types";

function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreFlow(
  message: string,
  flow: (typeof OBOT_FLOWS)[number],
  role: HelpAssistantRole,
): number {
  if (flow.roles !== "all" && !flow.roles.includes(role)) return 0;
  const n = norm(message);
  let score = 0;
  for (const kw of flow.keywords) {
    const k = norm(kw);
    if (n.includes(k)) score += k.length > 4 ? 2 : 1;
  }
  return score;
}

function roleDefaultReply(role: HelpAssistantRole): OBotReply {
  switch (role) {
    case "anonymous":
      return {
        answer:
          "ORIVONA bir organizasyon marketplace'idir: müşteriler etkinlik planlar, hizmet sağlayıcı işletmeler teklif sunar. Marketplace'i gezinmek için giriş şart değildir; teklif ve plan için müşteri veya işletme hesabı açın.",
        actions: [OBOT_ACTIONS.marketplace, OBOT_ACTIONS.login, OBOT_ACTIONS.register],
        suggestedQuestions: OBOT_QUICK_QUESTIONS.anonymous,
      };
    case "customer":
      return {
        answer:
          "Müşteri olarak organizasyon planınızı Etkinlik Planlarım'da yönetirsiniz. Marketplace'ten hizmet arayın, teklif isteyin, rezervasyon ve davetli/QR süreçlerini panelden takip edin. Aşağıdaki hızlı sorulardan birini seçebilirsiniz.",
        actions: [
          { ...OBOT_ACTIONS["create-event"], label: "Etkinlik Planlarım" },
          OBOT_ACTIONS["ai-planner"],
          OBOT_ACTIONS.marketplace,
        ],
        suggestedQuestions: OBOT_QUICK_QUESTIONS.customer,
      };
    case "vendor":
      return {
        answer:
          "Hizmet sağlayıcı işletme olarak İşletme Paneli'nde hizmet ilanı, müsaitlik takvimi, teklif yanıtlama, rezervasyon ve CRM süreçlerini yönetirsiniz. ORIVONA hizmet sunumu platformudur; ürün satışı veya mağaza modeli kullanılmaz.",
        actions: [
          OBOT_ACTIONS["vendor-services"],
          OBOT_ACTIONS["vendor-offers"],
          OBOT_ACTIONS["vendor-availability"],
        ],
        suggestedQuestions: OBOT_QUICK_QUESTIONS.vendor,
      };
    case "admin":
      return {
        answer:
          "Admin olarak işletme onayı, kategori, kullanıcı durumu ve rozet/öne çıkarma ayarlarını yönetirsiniz. Admin panelinden işletme ve hizmet tablolarına gidin.",
        actions: [OBOT_ACTIONS["admin-dashboard"], OBOT_ACTIONS.faq],
        suggestedQuestions: OBOT_QUICK_QUESTIONS.admin,
      };
  }
}

export function getObotFallbackReply(
  message: string,
  role: HelpAssistantRole,
): OBotReply {
  let best: { flow: (typeof OBOT_FLOWS)[number]; score: number } | null = null;

  for (const flow of OBOT_FLOWS) {
    const score = scoreFlow(message, flow, role);
    if (score > 0 && (!best || score > best.score)) {
      best = { flow, score };
    }
  }

  if (best && best.score >= 1) {
    const reply = { ...best.flow.reply };
    if (!reply.suggestedQuestions) {
      reply.suggestedQuestions = OBOT_QUICK_QUESTIONS[role].slice(0, 4);
    }
    return reply;
  }

  return roleDefaultReply(role);
}

/** Reject weak API answers; triggers fallback in caller. */
export function isWeakObotAnswer(text: string): boolean {
  const n = norm(text);
  const weakPhrases = [
    "bulamadim",
    "eslesme bulamad",
    "ozel rehber",
    "net bir yanit",
    "anlayamadim",
    "satici panel",
    "seller panel",
    "urun satis",
    "magaza",
  ];
  return weakPhrases.some((p) => n.includes(p));
}

/** Sanitize legacy terminology in API text (display-only). */
export function sanitizeObotTerminology(text: string): string {
  return text
    .replace(/\bsatıcı paneli\b/gi, "işletme paneli")
    .replace(/\bsatıcı\b/gi, "işletme")
    .replace(/\bseller\b/gi, "business")
    .replace(/\bürün satışı\b/gi, "hizmet sunumu")
    .replace(/\bmağaza\b/gi, "marketplace");
}
