import type { HelpAssistantRole } from "@/src/lib/obot/types";

export const OBOT_QUICK_QUESTIONS: Record<HelpAssistantRole, string[]> = {
  anonymous: [
    "ORIVONA nedir?",
    "Etkinlik nasıl oluştururum?",
    "İşletme olarak ilan nasıl veririm?",
    "Giriş yapmam gerekiyor mu?",
  ],
  customer: [
    "Etkinlik nasıl oluştururum?",
    "Teklif nasıl isterim?",
    "QR davetiye nasıl oluşturulur?",
    "AI Planlayıcı ne yapar?",
    "Rezervasyon süreci nasıl işler?",
  ],
  vendor: [
    "İşletme olarak ilan nasıl veririm?",
    "Müsaitlik nasıl ayarlanır?",
    "Gelen tekliflere nasıl cevap verilir?",
    "Revize teklif nasıl gönderilir?",
    "CRM ne işe yarar?",
  ],
  admin: [
    "İşletme onayı nasıl yapılır?",
    "Kategoriler nasıl yönetilir?",
    "Badge nasıl verilir?",
    "Kullanıcı nasıl pasif yapılır?",
  ],
};
