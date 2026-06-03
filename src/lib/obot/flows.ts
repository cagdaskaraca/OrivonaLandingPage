/**
 * OBot predefined knowledge flows — organizasyon marketplace terminology.
 */
import { OBOT_ACTIONS } from "@/src/lib/obot/actions";
import type { HelpAssistantRole, OBotReply } from "@/src/lib/obot/types";

export type OBotFlow = {
  id: string;
  keywords: string[];
  roles: HelpAssistantRole[] | "all";
  reply: OBotReply;
};

export const OBOT_FLOWS: OBotFlow[] = [
  {
    id: "create-event",
    keywords: [
      "etkinlik",
      "olustur",
      "oluştur",
      "organizasyon plan",
      "etkinlik plan",
    ],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "Etkinlik oluşturmak için müşteri panelinizdeki Etkinlik Planlarım alanına gidin. Buradan yeni organizasyon planı açabilir, etkinlik tarihini belirleyebilir, davetli listesi hazırlayabilir ve AI Planlayıcı ile otomatik organizasyon taslağı oluşturabilirsiniz.\n\nAdımlar: 1) Müşteri paneline girin. 2) Etkinlik Planlarım → yeni plan. 3) İsterseniz AI Planlayıcı veya Etkinlik Sihirbazı ile hızlandırın. 4) Marketplace'ten hizmet sağlayıcı işletmelerden teklif isteyin.",
      actions: [
        OBOT_ACTIONS["create-event"],
        OBOT_ACTIONS["ai-planner"],
        OBOT_ACTIONS.marketplace,
      ],
    },
  },
  {
    id: "business-account",
    keywords: [
      "isletme",
      "işletme",
      "hesap",
      "kayit",
      "kayıt",
      "basvuru",
      "başvuru",
      "hizmet saglayici",
      "hizmet sağlayıcı",
      "ilan",
      "mekan",
      "catering",
    ],
    roles: ["vendor", "anonymous"],
    reply: {
      answer:
        "Hizmet sağlayıcı işletme hesabı; mekan, organizasyon firması, fotoğrafçı veya catering gibi organizasyon hizmeti sunan taraflar içindir. Kayıt Ol ekranından işletme rolünü seçin, ardından İşletme Paneli → İşletme profilinizi ve hizmet ilanlarınızı tamamlayın.\n\nOnay sonrası marketplace'te listelenir ve müşterilerden teklif talebi alırsınız. ORIVONA ürün satışı değil; hizmet sunumu ve teklif akışı platformudur.",
      actions: [
        OBOT_ACTIONS.register,
        OBOT_ACTIONS["vendor-profile"],
        OBOT_ACTIONS["vendor-services"],
      ],
    },
  },
  {
    id: "service-listing",
    keywords: ["hizmet", "ilan", "liste", "ekle", "yayin", "yayın"],
    roles: ["vendor"],
    reply: {
      answer:
        "Hizmet ilanı eklemek için İşletme Paneli → Hizmetlerim → Yeni hizmet ekleyin. Başlık, kategori, şehir, kapasite ve organizasyon hizmeti açıklamasını girin. Kaydettikten sonra müşteriler marketplace'te ilanınızı görür ve teklif isteyebilir.",
      actions: [OBOT_ACTIONS["vendor-services"]],
    },
  },
  {
    id: "request-offer",
    keywords: ["teklif", "iste", "isteğ", "fiyat", "talep"],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "Teklif istemek için marketplace'te bir organizasyon hizmeti seçin ve Teklif İste düğmesine basın. Etkinlik tarihi, kişi sayısı ve notlarınızı girin. Hizmet veren işletme size özel fiyat ve koşulla yanıt verir; Tekliflerim bölümünden karşılaştırıp kabul edebilirsiniz.",
      actions: [
        OBOT_ACTIONS.marketplace,
        OBOT_ACTIONS["event-requests"],
        OBOT_ACTIONS["request-offer"],
      ],
    },
  },
  {
    id: "reservation",
    keywords: ["rezervasyon", "onayla", "kesinlestir", "kesinleştir"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "Rezervasyon; kabul edilen teklif sonrası kesinleşen organizasyon kaydıdır. Müşteri: Tekliflerim → kabul → Rezervasyonlarım. İşletme: Gelen teklifleri yanıtlayın; onaylanan kayıtlar Rezervasyonlar bölümünde listelenir.",
      actions: [
        OBOT_ACTIONS.reservations,
        OBOT_ACTIONS["vendor-offers"],
      ],
    },
  },
  {
    id: "availability",
    keywords: ["musait", "müsait", "takvim", "dolu", "tarih"],
    roles: ["vendor"],
    reply: {
      answer:
        "Müsaitlik takviminde hangi günlerin organizasyon için açık veya dolu olduğunuzu işaretleyin. Müşteriler doğru tarihle teklif isteyebilir; güncel takvim gereksiz talep reddini azaltır.",
      actions: [OBOT_ACTIONS["vendor-availability"]],
    },
  },
  {
    id: "qr-invite",
    keywords: ["qr", "bilet", "davetiye", "check"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "QR davetiye; misafirin dijital biletidir. Müşteri: Davetliler listesinde RSVP sonrası bilet/QR işlemleri. İşletme: etkinlik günü QR Check-in ile giriş doğrulaması yapabilirsiniz.",
      actions: [OBOT_ACTIONS.guests],
    },
  },
  {
    id: "guest-list",
    keywords: ["davetli", "misafir", "liste", "ekle"],
    roles: ["customer"],
    reply: {
      answer:
        "Davetli listesi için önce Etkinlik Planlarım'dan aktif planı seçin, sonra Davetliler bölümünden ad, iletişim ekleyin. Ortak davet linki ile toplu RSVP de alabilirsiniz.",
      actions: [OBOT_ACTIONS.guests, OBOT_ACTIONS["public-invite"]],
    },
  },
  {
    id: "seating-plan",
    keywords: ["masa", "masa plan", "oturma", "sandalye", "yerlesim", "yerleşim"],
    roles: ["customer"],
    reply: {
      answer:
        "Masa planı için Etkinlik Planlarım'dan aktif planı seçin, ardından Masa Planı bölümünden masaları ekleyip davetlileri sandalyelere yerleştirin.",
      actions: [OBOT_ACTIONS.seating, OBOT_ACTIONS.guests],
    },
  },
  {
    id: "invitation-studio",
    keywords: [
      "davetiye tasar",
      "davetiye stu",
      "davetiye tasarla",
      "studio",
      "stu dyo",
      "canva",
    ],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "Davetiye Tasarımı bölümünden şablon seçerek metin, görsel, QR ve şekillerle davetiye hazırlayabilirsiniz. Tasarımı kaydedip teklif talebinize ekleyebilirsiniz.",
      actions: [
        OBOT_ACTIONS["invitation-design"],
        OBOT_ACTIONS["request-offer"],
      ],
    },
  },
  {
    id: "crm-pipeline",
    keywords: ["crm", "pipeline", "lead", "asama", "aşama"],
    roles: ["vendor"],
    reply: {
      answer:
        "CRM Pipeline; müşteri teklif taleplerini aşamalara (yeni, görüşmede, kazanıldı vb.) ayırarak organizasyon teklif huninizi görselleştirir. İşletme CRM tablosunda detay ve notları yönetirsiniz.",
      actions: [OBOT_ACTIONS["vendor-crm"]],
    },
  },
  {
    id: "messaging",
    keywords: ["mesaj", "yaz", "iletisim", "iletişim", "sohbet"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "Mesajlaşma; müşteri ile hizmet sağlayıcı işletme arasında teklif öncesi ve sonrası koordinasyon içindir. Hizmet detayından ilk mesajı başlatın; tüm konuşmalar panelinizdeki Mesajlar bölümünde toplanır.",
      actions: [OBOT_ACTIONS.messages, OBOT_ACTIONS["vendor-messages"]],
    },
  },
  {
    id: "favorites",
    keywords: ["favori", "kaydet", "kalp", "begeni"],
    roles: ["customer"],
    reply: {
      answer:
        "Beğendiğiniz organizasyon hizmetlerini marketplace kartındaki kalp ile favorilere ekleyin. Favorilerim bölümünden tekrar açıp teklif isteyebilirsiniz.",
      actions: [OBOT_ACTIONS.favorites, OBOT_ACTIONS.marketplace],
    },
  },
  {
    id: "reviews",
    keywords: ["yorum", "degerlendirme", "değerlendirme", "puan", "review"],
    roles: ["customer", "vendor"],
    reply: {
      answer:
        "Değerlendirme sistemi; tamamlanan organizasyon hizmetleri sonrası müşteri geri bildirimini yansıtır. İşletmeler Yorum özeti bölümünden itibar metriklerini takip edebilir; müşteriler hizmet detayında yorumları okuyabilir.",
      actions: [
        {
          id: "review-intel",
          label: "Yorum özeti",
          href: "/vendor/dashboard",
          sectionId: "dashboard-review-intel",
        },
        OBOT_ACTIONS.marketplace,
      ],
    },
  },
  {
    id: "ai-planner",
    keywords: ["ai", "planlayici", "planlayıcı", "yapay", "zeka"],
    roles: ["customer", "anonymous"],
    reply: {
      answer:
        "AI Planlayıcı; etkinlik türü, şehir, kişi sayısı ve bütçeye göre checklist, bütçe dağılımı ve önerilen organizasyon hizmetleri üretir. Planı kaydedip Etkinlik Planlarım ile birleştirebilirsiniz.",
      actions: [OBOT_ACTIONS["ai-planner"], OBOT_ACTIONS["create-event"]],
    },
  },
  {
    id: "business-verification",
    keywords: ["onay", "dogrulama", "doğrulama", "belge", "verified"],
    roles: ["vendor", "admin"],
    reply: {
      answer:
        "İşletme doğrulama: profil ve belgeleriniz ORIVONA ekibi tarafından incelenir. İşletme → İşletme profili bölümünü eksiksiz doldurun. Admin kullanıcılar Admin panelinden işletmeyi onaylar veya geri bildirim verir.",
      actions: [OBOT_ACTIONS["vendor-profile"], OBOT_ACTIONS["admin-dashboard"]],
    },
  },
  {
    id: "marketplace-search",
    keywords: ["marketplace", "ara", "kesfet", "keşfet", "filtre"],
    roles: "all",
    reply: {
      answer:
        "ORIVONA organizasyon marketplace'inde şehir, kategori ve anahtar kelime ile hizmet sağlayıcı işletmeleri arayın. Karttan detay, teklif iste veya mesaj gönder ile iletişime geçin.",
      actions: [OBOT_ACTIONS.marketplace],
    },
  },
  {
    id: "revise-offer",
    keywords: ["revize", "guncelle", "güncelle", "fiyatli", "fiyatlı", "teklif gonder"],
    roles: ["vendor"],
    reply: {
      answer:
        "Revize teklif için İşletme Paneli → Gelen Teklif Talepleri bölümünde ilgili talebi açın ve Fiyatlı Teklif Gönder modalında güncel fiyat, paket açıklaması ve geçerlilik tarihini girin. Müşteri güncel teklifi Tekliflerim'de görür.",
      actions: [OBOT_ACTIONS["vendor-offers"]],
    },
  },
  {
    id: "what-is-orivona",
    keywords: ["orivona", "nedir", "ne ise", "platform"],
    roles: "all",
    reply: {
      answer:
        "ORIVONA; organizasyon planlayan müşteriler ile mekan, catering, fotoğrafçı ve organizasyon firması gibi hizmet sunan işletmeleri buluşturan AI destekli bir organizasyon marketplace'idir. Ürün satışı değil; hizmet keşfi, teklif, rezervasyon ve misafir yönetimi sunar.",
      actions: [OBOT_ACTIONS.marketplace, OBOT_ACTIONS.faq],
    },
  },
];
