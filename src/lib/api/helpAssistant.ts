import { apiPost, apiPostPublic } from "@/src/lib/api/client";
import { getToken } from "@/src/lib/auth";
import type { HelpAssistantRole, OBotAction, OBotReply } from "@/src/lib/obot/types";
import { OBOT_ACTIONS, resolveObotAction } from "@/src/lib/obot/actions";

type RawAssistantBody = {
  answer?: string;
  text?: string;
  message?: string;
  actions?: Array<Partial<OBotAction> & { label: string }>;
  suggestedQuestions?: string[];
  suggestions?: string[];
};

function normalizeActions(
  raw?: Array<Partial<OBotAction> & { label: string }>,
): OBotAction[] | undefined {
  if (!raw?.length) return undefined;
  return raw.map((a) =>
    resolveObotAction({
      id: a.id,
      label: a.label,
      href: a.href,
      sectionId: a.sectionId,
    }),
  );
}

function normalizeReply(body: unknown): OBotReply | null {
  const data =
    body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body;

  if (!data || typeof data !== "object") return null;
  const raw = data as RawAssistantBody;
  const answer = raw.answer ?? raw.text ?? raw.message;
  if (!answer || typeof answer !== "string") return null;

  return {
    answer: answer.trim(),
    actions: normalizeActions(raw.actions),
    suggestedQuestions: raw.suggestedQuestions ?? raw.suggestions,
  };
}

/** POST /help/assistant — falls back to null when endpoint missing. */
export async function postHelpAssistant(
  message: string,
  role: HelpAssistantRole,
): Promise<OBotReply | null> {
  const payload = { message: message.trim(), role };
  const hasToken = Boolean(getToken());

  try {
    const body = hasToken
      ? await apiPost<unknown>("/help/assistant", payload)
      : await apiPostPublic<unknown>("/help/assistant", payload);
    return normalizeReply(body);
  } catch {
    return null;
  }
}

export function welcomeReply(role: HelpAssistantRole): OBotReply {
  const intros: Record<HelpAssistantRole, string> = {
    anonymous:
      "Merhaba, ben OBot. ORIVONA hakkında sorularınızı yanıtlayabilirim. Giriş yapmadan marketplace'i keşfedebilir; teklif ve etkinlik için müşteri veya işletme hesabı açmanız gerekir.",
    customer:
      "Merhaba, ben OBot. Etkinlik planı, teklif, rezervasyon, davetli ve QR süreçlerinde size yol gösterebilirim.",
    vendor:
      "Merhaba, ben OBot. Hizmet ilanı, müsaitlik, teklif yanıtlama ve CRM konularında yardımcı olabilirim.",
    admin:
      "Merhaba, ben OBot. İşletme onayı, kategori, kullanıcı ve rozet yönetimi hakkında yönlendirme yapabilirim.",
  };

  const actions =
    role === "anonymous"
      ? [OBOT_ACTIONS.login, OBOT_ACTIONS.register, OBOT_ACTIONS.marketplace]
      : role === "customer"
        ? [OBOT_ACTIONS["create-event"], OBOT_ACTIONS["ai-planner"], OBOT_ACTIONS.marketplace]
        : role === "vendor"
          ? [
              OBOT_ACTIONS["vendor-services"],
              OBOT_ACTIONS["vendor-offers"],
              OBOT_ACTIONS["vendor-availability"],
            ]
          : [OBOT_ACTIONS["admin-dashboard"], OBOT_ACTIONS.faq];

  return {
    answer: intros[role],
    actions,
  };
}
