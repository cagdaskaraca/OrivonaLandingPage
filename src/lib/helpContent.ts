/** Shared onboarding / help copy (Turkish). */

export const MARKETPLACE_EDUCATION =
  "Teklif isteyebilir, rezervasyon oluşturabilir ve işletmelerle doğrudan iletişim kurabilirsiniz.";

export const HOW_IT_WORKS_STEPS = [
  {
    id: "plan",
    title: "Organizasyonunu oluştur",
    description:
      "Etkinlik planınızı oluşturun veya AI Planlayıcı ile dakikalar içinde checklist ve bütçe taslağı alın.",
    icon: "plan" as const,
  },
  {
    id: "discover",
    title: "Marketplace'te hizmet keşfet",
    description:
      "Şehir, kategori ve bütçeye göre doğrulanmış mekan, catering, fotoğrafçı ve daha fazlasını bulun.",
    icon: "discover" as const,
  },
  {
    id: "offer",
    title: "Teklif iste / rezervasyon oluştur",
    description:
      "Beğendiğiniz hizmetlerden teklif isteyin; işletmeler size özel fiyat ve koşul sunar.",
    icon: "offer" as const,
  },
  {
    id: "approve",
    title: "İşletme onayı al",
    description:
      "Teklifleri karşılaştırın, mesajlaşın ve onaylanan rezervasyonunuzla süreci netleştirin.",
    icon: "approve" as const,
  },
  {
    id: "invite",
    title: "Misafirlerini davet et",
    description:
      "Davetli listesi, RSVP ve ortak davet linki ile misafirlerinizi tek yerden yönetin.",
    icon: "invite" as const,
  },
  {
    id: "qr",
    title: "QR ile etkinliğini yönet",
    description:
      "Kişisel veya ortak QR biletlerle giriş kontrolü ve etkinlik günü organizasyonunu kolaylaştırın.",
    icon: "qr" as const,
  },
] as const;

export const TRUST_PILLARS = [
  {
    title: "Doğrulanmış işletmeler",
    body: "Profil ve belge kontrolleriyle güvenilir hizmet sağlayıcıları marketplace'te listelenir.",
    icon: "verified" as const,
  },
  {
    title: "AI destekli planlama",
    body: "Bütçe, checklist ve hizmet önerileriyle organizasyonunuzu hızlandırın.",
    icon: "ai" as const,
  },
  {
    title: "Güvenli rezervasyon akışı",
    body: "Teklif, onay ve rezervasyon adımları şeffaf ve takip edilebilir.",
    icon: "reservation" as const,
  },
  {
    title: "QR davetiye sistemi",
    body: "Dijital davetiye, RSVP ve QR bilet ile misafir deneyimini modernleştirin.",
    icon: "qr" as const,
  },
] as const;

export type FaqItem = { id: string; question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what",
    question: "ORIVONA nedir?",
    answer:
      "ORIVONA, düğün, nişan, doğum günü ve kurumsal etkinlikler için hizmet sağlayıcıları keşfetmenizi, teklif almanızı ve organizasyonunuzu tek platformdan yönetmenizi sağlayan AI destekli bir marketplace'tir.",
  },
  {
    id: "reservation",
    question: "Rezervasyon nasıl çalışır?",
    answer:
      "Marketplace'te hizmet seçip teklif isteyebilir veya kabul ettiğiniz teklifle rezervasyon oluşturabilirsiniz. İşletme onayı sonrası rezervasyonunuz panelinizde görünür ve süreç mesajlaşma ile takip edilir.",
  },
  {
    id: "offers",
    question: "Teklif sistemi nasıl çalışır?",
    answer:
      "Bir hizmet için teklif talebi gönderirsiniz; işletme size özel fiyat, tarih ve koşullarla yanıt verir. Birden fazla teklifi karşılaştırıp uygun olanı kabul edebilirsiniz.",
  },
  {
    id: "vendor-approval",
    question: "İşletmeler nasıl onaylanır?",
    answer:
      "İşletmeler başvuru yapar; ORIVONA ekibi profil ve belgeleri inceler. Onaylanan işletmeler marketplace'te görünür ve müşterilerden teklif alabilir.",
  },
  {
    id: "ai",
    question: "AI Planlayıcı ne yapar?",
    answer:
      "Etkinlik türü, şehir, kişi sayısı ve bütçenize göre checklist, bütçe dağılımı, zaman çizelgesi ve önerilen hizmetler üretir. Planınızı kaydedip marketplace ile birleştirebilirsiniz.",
  },
  {
    id: "qr",
    question: "QR davetiye sistemi nasıl çalışır?",
    answer:
      "Davetlilerinize link veya e-posta ile davet gönderebilir; RSVP sonrası kişisel QR bilet oluşturulur. Etkinlik günü QR ile giriş doğrulanabilir.",
  },
  {
    id: "payment",
    question: "Ödeme sistemi var mı?",
    answer:
      "Rezervasyon ve teklif süreçleri platformda yönetilir. Ödeme koşulları işletme ile anlaşmanıza göre şekillenir; detaylar teklif ve rezervasyon ekranlarında yer alır.",
  },
  {
    id: "become-vendor",
    question: "Hizmet sağlayıcı nasıl olunur?",
    answer:
      "Ana sayfadaki İşletme Başvurusu veya kayıt ekranından işletme hesabı oluşturun. Profilinizi tamamlayıp hizmetlerinizi ekledikten sonra onay sürecine alınırsınız.",
  },
  {
    id: "pricing",
    question: "Etkinlik oluşturmak ücretli mi?",
    answer:
      "Müşteri hesabı oluşturmak ve etkinlik planı açmak ücretsizdir. Hizmet bedelleri işletmelerin tekliflerine göre belirlenir.",
  },
  {
    id: "contact-vendor",
    question: "Müşteriler işletmelere nasıl ulaşır?",
    answer:
      "Hizmet detay sayfasından mesaj gönderebilir veya teklif isteyebilirsiniz. Tüm iletişim ve teklif geçmişi panelinizde saklanır.",
  },
];

export type DashboardHelpCard = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  sectionId?: string;
  hint?: string;
};

export const CUSTOMER_HELP_CARDS: DashboardHelpCard[] = [
  {
    id: "first-offer",
    title: "İlk teklifinizi oluşturun",
    description:
      "Marketplace'te bir hizmet seçin ve Teklif İste ile işletmeden özel fiyat alın.",
    cta: "Marketplace'e git",
    href: "/marketplace",
    hint: "Teklifler, işletmelerin size özel döndüğü fiyat teklifleridir.",
  },
  {
    id: "event-plan",
    title: "Etkinlik planınızı oluşturun",
    description:
      "Smart Event OS ile checklist, davetli ve hatırlatmaları tek yerden yönetin.",
    cta: "Planlara git",
    sectionId: "event-os-plans",
    hint: "AI Planlayıcı ile hızlı başlangıç yapabilirsiniz.",
  },
  {
    id: "guests",
    title: "Davetli listenizi yönetin",
    description:
      "Davetlileri ekleyin, RSVP takip edin ve ortak davet linkini paylaşın.",
    cta: "Davetlilere git",
    sectionId: "event-os-guests",
  },
  {
    id: "messages",
    title: "İşletmelerle mesajlaşın",
    description:
      "Teklif öncesi veya sonrası sorularınızı doğrudan işletmeye iletin.",
    cta: "Mesajlara git",
    sectionId: "dashboard-messages",
  },
];

export const VENDOR_HELP_CARDS: DashboardHelpCard[] = [
  {
    id: "availability",
    title: "Müsaitlik takviminizi güncelleyin",
    description:
      "Dolu ve müsait günlerinizi güncel tutun; müşteriler doğru beklentiyle teklif istesin.",
    cta: "Takvime git",
    sectionId: "dashboard-availability",
    hint: "Yoğunluk takviminiz marketplace görünürlüğünü destekler.",
  },
  {
    id: "services",
    title: "Hizmetlerinizi listeleyin",
    description:
      "Fotoğraf, açıklama ve fiyat bilgileriyle marketplace'te öne çıkın.",
    cta: "Hizmetlere git",
    sectionId: "dashboard-services",
  },
  {
    id: "offers",
    title: "Gelen teklifleri yanıtlayın",
    description:
      "Müşteri taleplerine hızlı dönüş verin; kabul veya red ile süreci netleştirin.",
    cta: "Tekliflere git",
    sectionId: "dashboard-offers",
    hint: "Hızlı dönüş, dönüşüm oranınızı artırır.",
  },
  {
    id: "profile",
    title: "İşletme profilinizi tamamlayın",
    description:
      "Onaylı ve eksiksiz profiller marketplace'te daha fazla güven oluşturur.",
    cta: "Profile git",
    sectionId: "dashboard-profile",
  },
];

export type EmptyStatePreset = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
  sectionId?: string;
};

export const EMPTY_STATE_PRESETS = {
  messages: {
    icon: "💬",
    title: "Henüz mesajınız yok",
    description:
      "Marketplace'te bir işletmeyle konuşmaya başlayın veya teklif sürecinde mesajlaşın.",
    actionLabel: "Marketplace'i keşfet",
    href: "/marketplace",
  },
  offersCustomer: {
    icon: "📋",
    title: "Henüz teklif talebiniz yok",
    description:
      "Beğendiğiniz hizmetlerden Teklif İste ile işletmelerden özel fiyat alın.",
    actionLabel: "Marketplace'e git",
    href: "/marketplace",
  },
  offersVendor: {
    icon: "📥",
    title: "Henüz teklif talebi yok",
    description:
      "Hizmetleriniz marketplace'te göründükçe müşteri talepleri burada listelenir.",
    actionLabel: "Hizmetleri güncelle",
    sectionId: "dashboard-services",
  },
  reservationsCustomer: {
    icon: "📅",
    title: "Henüz rezervasyonunuz yok",
    description:
      "Kabul ettiğiniz tekliflerden rezervasyon oluşturabilir veya işletme onayı bekleyebilirsiniz.",
    actionLabel: "Tekliflere bak",
    sectionId: "dashboard-offers",
  },
  reservationsVendor: {
    icon: "📅",
    title: "Henüz rezervasyon yok",
    description:
      "Onaylanan teklifler ve müşteri rezervasyonları burada görünecek.",
    actionLabel: "Tekliflere git",
    sectionId: "dashboard-offers",
  },
  guests: {
    icon: "👥",
    title: "Henüz davetli yok",
    description:
      "Davetlilerinizi ekleyin, RSVP toplayın ve QR bilet paylaşın.",
    actionLabel: "Davetli ekle",
    sectionId: "event-os-guests",
  },
  marketplaceSearch: {
    icon: "🔍",
    title: "Hizmet bulun",
    description:
      "Filtreleri doldurup Ara'ya basarak marketplace'te hizmet arayın.",
    actionLabel: "Filtreleri temizle",
  },
} as const satisfies Record<string, EmptyStatePreset>;
