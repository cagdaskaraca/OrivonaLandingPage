import { OBOT_ACTIONS } from "@/src/lib/obot/actions";
import { OBOT_QUICK_QUESTIONS } from "@/src/lib/obot/suggestedQuestions";
import type { HelpAssistantRole, OBotReply } from "@/src/lib/obot/types";

type Rule = {
  keywords: string[];
  roles: HelpAssistantRole[] | "all";
  score?: number;
  reply: OBotReply;
};

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

const RULES: Rule[] = [
  {
    keywords: ["orivona", "nedir", "ne ise", "platform"],
    roles: "all",
    reply: {
      answer:
        "ORIVONA; etkinlik organizasyonu için hizmet keşfi, teklif, rezervasyon ve misafir yönetimini (davetli, RSVP, QR) bir arada sunan AI destekli bir marketplace'tir. Ana sayfadan marketplace'i inceleyebilir, hesap açarak panele geçebilirsiniz.",
      actions: [OBOT_ACTIONS.marketplace, OBOT_ACTIONS.faq],
    },
  },
  {
    keywords: ["etkinlik", "olustur", "plan", "organizasyon"],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "Etkinlik oluşturmak için müşteri panelinde Etkinlik Planlarım bölümüne gidebilirsiniz. İsterseniz AI Planlayıcı veya Etkinlik Sihirbazı ile otomatik plan da oluşturabilirsiniz.",
      actions: [
        OBOT_ACTIONS["create-event"],
        OBOT_ACTIONS["ai-planner"],
      ],
    },
  },
  {
    keywords: ["ai", "planlayici", "planlayıcı", "yapay"],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "AI Planlayıcı; etkinlik türü, şehir, kişi sayısı ve bütçenize göre checklist ve bütçe taslağı üretir. /ai-planner sayfasından formu doldurup planı kaydedebilirsiniz.",
      actions: [OBOT_ACTIONS["ai-planner"], OBOT_ACTIONS["create-event"]],
    },
  },
  {
    keywords: ["marketplace", "ara", "hizmet", "kesfet", "keşfet"],
    roles: "all",
    reply: {
      answer:
        "Marketplace'te şehir, kategori ve anahtar kelime ile arama yapın. Sonuç kartından detay, teklif iste veya mesaj gönder seçeneklerini kullanın.",
      actions: [OBOT_ACTIONS.marketplace],
    },
  },
  {
    keywords: ["teklif", "fiyat", "talep"],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "Beğendiğiniz hizmette Teklif İste düğmesine basın; tarih ve bütçe bilgilerini girin. İşletme fiyatlı teklif gönderince Tekliflerim bölümünden görürsünüz.",
      actions: [OBOT_ACTIONS.marketplace, OBOT_ACTIONS["request-offer"]],
    },
  },
  {
    keywords: ["rezervasyon", "onay", "iptal"],
    roles: ["customer"],
    reply: {
      answer:
        "Rezervasyon; kabul ettiğiniz teklif sonrası kesinleşen etkinlik kaydıdır. Müşteri Paneli → Rezervasyonlarım bölümünden listeleyebilir ve mesajla işletmeyle koordine edebilirsiniz.",
      actions: [OBOT_ACTIONS.reservations, OBOT_ACTIONS["request-offer"]],
    },
  },
  {
    keywords: ["rezervasyon", "onay", "iptal"],
    roles: ["vendor"],
    reply: {
      answer:
        "Onaylanan teklifler rezervasyona dönüşür. İşletme Paneli → Rezervasyonlar bölümünden takip edin; gerekirse müşteriyle Mesajlar üzerinden detay netleştirin.",
      actions: [
        {
          id: "vendor-reservations",
          label: "Rezervasyonlar",
          href: "/vendor/dashboard",
          sectionId: "dashboard-reservations",
        },
        OBOT_ACTIONS["vendor-messages"],
      ],
    },
  },
  {
    keywords: ["mesaj", "yaz", "iletisim", "iletişim"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "Mesajlar panelinizde toplanır. Müşteri: dashboard-messages. İşletme: aynı bölüm vendor panelinde. İlk mesajı genelde hizmet detayından başlatırsınız.",
      actions: [OBOT_ACTIONS.messages, OBOT_ACTIONS["vendor-messages"]],
    },
  },
  {
    keywords: ["favori", "kaydet", "kalp"],
    roles: ["customer"],
    reply: {
      answer:
        "Marketplace kartındaki kalp simgesiyle favoriye ekleyin. Tüm favoriler Müşteri Paneli → Favoriler bölümündedir.",
      actions: [OBOT_ACTIONS.favorites, OBOT_ACTIONS.marketplace],
    },
  },
  {
    keywords: ["davetli", "liste", "misafir"],
    roles: ["customer"],
    reply: {
      answer:
        "Önce Etkinlik Planlarım'dan plan seçin, ardından Davetliler bölümünden ad-soyad ve iletişim ekleyin.",
      actions: [OBOT_ACTIONS.guests, OBOT_ACTIONS["create-event"]],
    },
  },
  {
    keywords: ["ortak", "link", "paylas", "paylaş", "davet"],
    roles: ["customer"],
    reply: {
      answer:
        "Ortak Davet Linki bölümünden planınıza bağlı URL'yi kopyalayın veya WhatsApp ile paylaşın. Misafirler RSVP verince Davetliler tablosu güncellenir.",
      actions: [OBOT_ACTIONS["public-invite"], OBOT_ACTIONS.guests],
    },
  },
  {
    keywords: ["qr", "bilet", "check"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "Davetli RSVP verdikten sonra QR bilet oluşturulabilir. Müşteri: Davetliler tablosundan bilet işlemleri. İşletme: QR Check-in bölümü etkinlik günü için.",
      actions: [OBOT_ACTIONS.guests],
    },
  },
  {
    keywords: ["rsvp", "katilim", "katılım", "yanit", "yanıt"],
    roles: ["customer"],
    reply: {
      answer:
        "RSVP özetini event-os-rsvp bölümünden, detayları Davetliler tablosundaki RSVP sütunundan takip edin.",
      actions: [OBOT_ACTIONS.guests],
    },
  },
  {
    keywords: ["masa", "oturma", "seating"],
    roles: ["customer"],
    reply: {
      answer:
        "Masa Planı bölümünde masa oluşturup davetlileri masalara atayın. Önce davetli listesini doldurmanız önerilir.",
      actions: [
        {
          id: "seating",
          label: "Masa planına git",
          href: "/customer/dashboard",
          sectionId: "event-os-seating",
        },
      ],
    },
  },
  {
    keywords: ["isletme", "işletme", "ilan", "hizmet ekle", "vendor", "satici"],
    roles: ["vendor", "anonymous"],
    reply: {
      answer:
        "İşletme hesabı için kayıt olun ve İşletme Paneli → Hizmetlerim'den yeni ilan ekleyin. Görselleri düzenle modunda yükleyin; müsaitlik takvimini güncel tutun.",
      actions: [
        OBOT_ACTIONS.register,
        OBOT_ACTIONS["vendor-services"],
        OBOT_ACTIONS["vendor-availability"],
      ],
    },
  },
  {
    keywords: ["onay", "basvuru", "başvuru", "belge"],
    roles: ["vendor", "admin"],
    reply: {
      answer:
        "İşletme onayı: vendor profilini tamamlayın, admin ekibi inceler. Admin: /admin/dashboard işletmeler tablosundan Onayla/Reddet.",
      actions: [OBOT_ACTIONS["vendor-profile"], OBOT_ACTIONS["admin-dashboard"]],
    },
  },
  {
    keywords: ["musait", "müsait", "takvim", "availability"],
    roles: ["vendor"],
    reply: {
      answer:
        "Müsaitlik takviminde günleri müsait veya dolu işaretleyin. Müşteriler doğru tarihle teklif isteyebilir.",
      actions: [OBOT_ACTIONS["vendor-availability"]],
    },
  },
  {
    keywords: ["revize", "guncelle", "güncelle", "fiyatli"],
    roles: ["vendor"],
    reply: {
      answer:
        "Revize teklif için Gelen Teklif Talepleri'nde Fiyatlı Teklif Gönder modalını yeniden açıp güncel fiyat ve açıklama girin.",
      actions: [OBOT_ACTIONS["vendor-offers"]],
    },
  },
  {
    keywords: ["crm", "pipeline", "lead"],
    roles: ["vendor"],
    reply: {
      answer:
        "CRM Pipeline teklifleri aşamalara ayırır; Vendor CRM tablosunda müşteri ve talep detaylarını görürsünüz.",
      actions: [OBOT_ACTIONS["vendor-crm"]],
    },
  },
  {
    keywords: ["analitik", "istatistik", "rapor"],
    roles: ["vendor"],
    reply: {
      answer:
        "Analitik bölümünde görüntülenme ve dönüşüm metriklerini inceleyin; düşük performanslı ilanlarda fotoğraf ve açıklamayı güncelleyin.",
      actions: [OBOT_ACTIONS["vendor-analytics"]],
    },
  },
  {
    keywords: ["kategori"],
    roles: ["admin"],
    reply: {
      answer:
        "Admin panelinde Kategori yönetimi bölümünden yeni kategori ekleyin veya mevcutları düzenleyin.",
      actions: [OBOT_ACTIONS["admin-dashboard"]],
    },
  },
  {
    keywords: ["kullanici", "kullanıcı", "pasif", "aktif"],
    roles: ["admin"],
    reply: {
      answer:
        "Admin → Kullanıcı yönetiminde ilgili satırda aktif/pasif düğmesini kullanın.",
      actions: [OBOT_ACTIONS["admin-dashboard"]],
    },
  },
  {
    keywords: ["badge", "premium", "one cikar", "öne çıkar", "rozet"],
    roles: ["admin"],
    reply: {
      answer:
        "Admin panelinde işletme veya hizmet satırını genişletin; Badge / Premium kontrollerinden rozet ve öne çıkarmayı yönetin.",
      actions: [OBOT_ACTIONS["admin-dashboard"]],
    },
  },
  {
    keywords: ["giris", "giriş", "login", "kayit", "kayıt"],
    roles: ["anonymous"],
    reply: {
      answer:
        "Teklif, mesaj ve etkinlik planı için giriş yapmanız gerekir. Müşteri veya işletme olarak kayıt olabilirsiniz.",
      actions: [OBOT_ACTIONS.login, OBOT_ACTIONS.register],
    },
  },
  {
    keywords: ["gorsel", "görsel", "foto", "medya"],
    roles: ["vendor"],
    reply: {
      answer:
        "Hizmetlerim'de hizmeti düzenle moduna alın; Service Image Manager ve Gelişmiş Medya panellerinden görsel yükleyin.",
      actions: [OBOT_ACTIONS["vendor-services"]],
    },
  },
];

function defaultReply(role: HelpAssistantRole): OBotReply {
  if (role === "anonymous") {
    return {
      answer:
        "Bu konuda net bir eşleşme bulamadım. Marketplace'i keşfedebilir veya giriş/kayıt ile panele geçebilirsiniz. Daha fazla bilgi için ana sayfadaki SSS bölümüne bakın.",
      actions: [OBOT_ACTIONS.marketplace, OBOT_ACTIONS.login, OBOT_ACTIONS.faq],
      suggestedQuestions: OBOT_QUICK_QUESTIONS.anonymous,
    };
  }
  return {
    answer:
      "Tam eşleşme bulamadım; aşağıdaki hızlı sorulardan birini deneyebilir veya SSS bölümüne göz atabilirsiniz.",
    actions: [OBOT_ACTIONS.faq],
    suggestedQuestions: OBOT_QUICK_QUESTIONS[role],
  };
}

export function getObotFallbackReply(
  message: string,
  role: HelpAssistantRole,
): OBotReply {
  const n = norm(message);
  let best: { rule: Rule; score: number } | null = null;

  for (const rule of RULES) {
    if (rule.roles !== "all" && !rule.roles.includes(role)) continue;
    let score = 0;
    for (const kw of rule.keywords) {
      if (n.includes(norm(kw))) score += kw.length > 4 ? 2 : 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { rule, score };
    }
  }

  if (best) {
    const reply = { ...best.rule.reply };
    if (!reply.suggestedQuestions) {
      reply.suggestedQuestions = OBOT_QUICK_QUESTIONS[role].slice(0, 4);
    }
    return reply;
  }

  return defaultReply(role);
}
