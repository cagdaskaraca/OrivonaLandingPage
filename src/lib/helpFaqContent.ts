/** Detailed FAQ copy grouped by audience (Turkish). */

export type FaqCategory = "customer" | "vendor" | "admin";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  /** Paragraphs separated by blank lines (\n\n). */
  answer: string;
};

export type FaqSection = {
  category: FaqCategory;
  label: string;
  description: string;
  items: FaqItem[];
};

function faq(
  id: string,
  category: FaqCategory,
  question: string,
  answer: string,
): FaqItem {
  return { id, category, question, answer };
}

const CUSTOMER_FAQ: FaqItem[] = [
  faq(
    "c-what",
    "customer",
    "ORIVONA nedir?",
    `Ne anlama gelir: ORIVONA; düğün, nişan, doğum günü ve kurumsal etkinlikler için hizmet sağlayıcıları keşfetmenizi, teklif almanızı, rezervasyon sürecini yönetmenizi ve misafirlerinizi (davetli, RSVP, QR) tek panelden takip etmenizi sağlayan AI destekli bir organizasyon marketplace'idir.

Nereye tıklarsınız: Ana sayfada (/) öne çıkan hizmetleri, Marketplace menüsünü veya giriş yaptıktan sonra Müşteri Paneli'ni kullanın. Üst menüden Kayıt Ol / Giriş Yap ile müşteri hesabı açabilirsiniz.

Sonra ne olur: Hesap açtığınızda müşteri panelinde etkinlik planları, teklifler, rezervasyonlar, mesajlar ve Smart Event OS (davetli, masa planı, ortak davet linki) bölümleri aktif olur. Marketplace'te beğendiğiniz işletmelere teklif isteyebilir veya mesaj gönderebilirsiniz.

Önemli not: Hizmet bedelleri işletmelerin size özel gönderdiği tekliflere göre belirlenir; platformda keşif ve planlama ücretsiz başlayabilir, ödeme koşulları teklif detayında yer alır.`,
  ),
  faq(
    "c-create-event",
    "customer",
    "Etkinlik nasıl oluşturulur?",
    `Ne anlama gelir: Etkinlik oluşturmak; tarih, tür, kişi sayısı ve ihtiyaçlarınızı sisteme kaydederek plan, checklist ve hizmet aramasını başlatmaktır. İki yol vardır: manuel etkinlik talebi veya Smart Event OS planı.

Nereye tıklarsınız: Giriş yaptıktan sonra Müşteri Paneli (/customer/dashboard) → sol menüden Etkinlik Planlarım (event-os-plans) veya Etkinlik Talepleri (dashboard-events). Hızlı başlangıç için üst araç çubuğundaki Etkinlik Sihirbazı (/event-wizard) veya AI Planlayıcı (/ai-planner) bağlantısını da kullanabilirsiniz.

Sonra ne olur: Plan oluşturduğunuzda checklist, hatırlatmalar, davetli ve masa planı modülleri aynı plan altında birbirine bağlanır. Etkinlik talebi oluşturduğunuzda talebiniz panelde listelenir; isterseniz marketplace'ten hizmet arayıp teklif sürecine geçersiniz.

Önemli not: Birden fazla planınız varsa davetli ve QR işlemleri için önce üstteki plan seçicisinden aktif planı seçtiğinizden emin olun.`,
  ),
  faq(
    "c-ai-planner",
    "customer",
    "AI Planlayıcı nasıl kullanılır?",
    `Ne anlama gelir: AI Planlayıcı; etkinlik türü, şehir, tarih, kişi sayısı ve bütçenize göre otomatik checklist, bütçe dağılımı, zaman çizelgesi ve önerilen hizmet kategorileri üretir.

Nereye tıklarsınız: Üst menüden AI Planlayıcı (/ai-planner) sayfasına gidin veya müşteri paneli araç çubuğundaki ilgili bağlantıyı kullanın. Formu doldurup plan oluştur / öneri al benzeri birincil düğmeye basın.

Sonra ne olur: Üretilen planı kaydedebilir, müşteri panelindeki Etkinlik Planlarım bölümünde açabilir ve marketplace önerileriyle hizmet aramaya devam edebilirsiniz. Kayıtlı planlar daha sonra düzenlenebilir.

Önemli not: AI çıktıları taslak niteliğindedir; nihai kararlarınızı işletme teklifleri ve sözleşme koşullarıyla doğrulayın. Giriş yapmadan deneme yapıyorsanız kaydetmek için giriş istenebilir.`,
  ),
  faq(
    "c-marketplace-search",
    "customer",
    "Marketplace'te hizmet nasıl aranır?",
    `Ne anlama gelir: Marketplace; onaylı işletmelerin mekan, catering, fotoğrafçı, müzik ve benzeri hizmetlerini şehir, kategori ve anahtar kelimeyle filtrelemenizi sağlar.

Nereye tıklarsınız: Üst menü → Marketplace (/marketplace). Sayfanın üstündeki bilgi bandını okuyun; ardından şehir, kategori ve arama kutusunu doldurup Ara düğmesine basın. Ana sayfadaki Öne Çıkan Hizmetler bölümünden de filtreli aramaya yönlenebilirsiniz.

Sonra ne olur: Sonuç kartlarında Detay, Teklif İste, Mesaj Gönder ve (giriş yaptıysanız) favori kalbi görünür. Bir karta tıklayınca hizmet detay sayfasına (/services/[id]) gidersiniz.

Önemli not: Teklif veya mesaj için müşteri olarak giriş yapmanız gerekir; giriş yoksa yönlendirme penceresi açılır.`,
  ),
  faq(
    "c-request-offer",
    "customer",
    "Teklif nasıl istenir?",
    `Ne anlama gelir: Teklif istemek; seçtiğiniz hizmet için işletmeye etkinlik detaylarınızı iletip size özel fiyat ve koşul almanızdır.

Nereye tıklarsınız: Marketplace veya hizmet detayında Teklif İste düğmesine basın. Açılan formda tarih, kişi sayısı, bütçe ve notlarınızı girin. Alternatif: müşteri paneli → Tekliflerim (dashboard-offers) bölümünden geçmiş talepleri izleyin.

Sonra ne olur: Talebiniz işletmeye düşer; işletme fiyatlı teklif gönderdiğinde panelinizde görürsünüz. Karşılaştırıp kabul edebilir veya mesajla detay sorabilirsiniz.

Önemli not: Birden fazla işletmeden paralel teklif isteyebilirsiniz; her teklif ayrı kart olarak listelenir.`,
  ),
  faq(
    "c-reservation",
    "customer",
    "Rezervasyon süreci nasıl işler?",
    `Ne anlama gelir: Rezervasyon; kabul ettiğiniz teklif veya işletme onayı sonrası etkinlik tarihinizin kesinleştiği kayıttır.

Nereye tıklarsınız: Müşteri Paneli → Tekliflerim'de teklifi inceleyin ve kabul akışını tamamlayın. Ardından Rezervasyonlarım (dashboard-reservations) bölümünden tüm rezervasyonlarınızı görün.

Sonra ne olur: Onaylı rezervasyon listede tarih, hizmet adı ve durum ile görünür. Gerekirse iptal düğmesi (uygun statülerde) ile iptal talep edebilirsiniz. Süreç boyunca Mesajlar bölümünden işletmeyle iletişim kurabilirsiniz.

Önemli not: Ödeme ve sözleşme detayları işletme teklif metninde yer alır; platform rezervasyon durumunu takip etmenizi sağlar.`,
  ),
  faq(
    "c-messaging",
    "customer",
    "İşletmelerle nasıl mesajlaşılır?",
    `Ne anlama gelir: Mesajlaşma; teklif öncesi sorular, revizyon talepleri ve rezervasyon sonrası koordinasyon için işletme ile güvenli sohbet kanalıdır.

Nereye tıklarsınız: Hizmet detayında Mesaj Gönder veya marketplace kartındaki mesaj kısayolu. Tüm konuşmalar: Müşteri Paneli → Mesajlar (dashboard-messages).

Sonra ne olur: Sol listeden konuşma seçer, sağda mesaj geçmişini görür ve alttaki kutudan yanıt yazarsınız. Yeni konuşma genelde ilk mesajı hizmet sayfasından başlatmanızla açılır.

Önemli not: Okunmamış mesajlar listede vurgulanır; teklif kartındaki işletme adıyla ilişkili konuşmayı bulmak için hizmet adına dikkat edin.`,
  ),
  faq(
    "c-favorites",
    "customer",
    "Favorilere nasıl eklenir?",
    `Ne anlama gelir: Favoriler; daha sonra teklif istemek veya karşılaştırmak üzere beğendiğiniz hizmetleri kaydetmenizi sağlar.

Nereye tıklarsınız: Marketplace sonuç kartlarında veya hizmet detayında kalp (favori) simgesine tıklayın. Giriş yapmanız gerekir. Kayıtlı favoriler: Müşteri Paneli → Favoriler (dashboard-favorites).

Sonra ne olur: Favoriye eklenen hizmet kalp dolu görünür; panelde liste halinde açıp detay veya teklif akışına geçebilirsiniz. Tekrar tıklayarak favoriden kaldırırsınız.

Önemli not: Favori işlemi oturumunuza bağlıdır; farklı cihazda aynı hesapla giriş yapın.`,
  ),
  faq(
    "c-guest-list",
    "customer",
    "Davetli listesi nasıl oluşturulur?",
    `Ne anlama gelir: Davetli listesi; etkinliğinize katılacak kişilerin ad, iletişim ve RSVP durumlarının tutulduğu Smart Event OS modülüdür.

Nereye tıklarsınız: Müşteri Paneli → önce Etkinlik Planlarım'dan plan seçin → Davetliler (event-os-guests). Yeni davetli için formdaki Ad Soyad, e-posta/telefon alanlarını doldurup ekle düğmesine basın.

Sonra ne olur: Davetliler tabloda listelenir; düzenleme, silme ve demo içe aktarma (varsa) seçenekleri görünür. RSVP ve bilet durumu sütunları güncellenir.

Önemli not: Davetli eklemeden önce doğru etkinlik planının seçili olduğundan emin olun; aksi halde veriler yanlış plana yazılabilir.`,
  ),
  faq(
    "c-public-invite",
    "customer",
    "Ortak davet linki nasıl paylaşılır?",
    `Ne anlama gelir: Ortak davet linki; tek bir URL ile misafirlerinizin RSVP sayfasına gitmesini ve yanıt vermesini sağlar (kişisel e-posta davetine alternatif).

Nereye tıklarsınız: Müşteri Paneli → Ortak Davet Linki (event-os-public-invite). Plan seçiliyken oluşturulan linki kopyalayın veya WhatsApp paylaş düğmesini kullanın.

Sonra ne olur: Misafir linki açar, katılım durumunu seçer; yanıtlar Davetliler ve RSVP bölümlerine yansır. Gerekirse linki yeniden paylaşabilirsiniz.

Önemli not: Linki yalnızca davet etmek istediğiniz kişilerle paylaşın; herkese açık sayfa ayarlarını Public Page bölümünden kontrol edin.`,
  ),
  faq(
    "c-qr-invite",
    "customer",
    "QR davetiye nasıl oluşur?",
    `Ne anlama gelir: QR davetiye; misafirin kişisel dijital biletidir; etkinlik girişinde veya check-in'de doğrulama için kullanılır.

Nereye tıklarsınız: Davetliler tablosunda ilgili misafir için bilet/QR oluştur veya gönder aksiyonlarını kullanın (plan ve RSVP durumuna bağlı). Davetli RSVP verdikten sonra QR üretimi mümkün olur.

Sonra ne olur: Misafir e-posta veya link ile QR biletine ulaşır; siz panelden bilet gönderildi mi durumunu takip edersiniz. Etkinlik günü QR Check-in (varsa) ile doğrulama yapılabilir.

Önemli not: QR, davetli kaydı ve RSVP ile ilişkilidir; önce davetliyi ekleyip yanıt almayı tamamlayın.`,
  ),
  faq(
    "c-rsvp-track",
    "customer",
    "RSVP cevapları nereden takip edilir?",
    `Ne anlama gelir: RSVP; misafirin Katılıyorum / Katılmıyorum / Belki yanıtıdır; katılımcı sayısı ve masa planı için kritiktir.

Nereye tıklarsınız: Müşteri Paneli → RSVP (event-os-rsvp) özet görünümü ve Davetliler (event-os-guests) tablosundaki RSVP sütunu. Ortak link veya kişisel davet sonrası güncellemeler burada görünür.

Sonra ne olur: Yanıt veren misafirin durumu ve yanıt tarihi güncellenir; filtreleyerek bekleyenleri görebilirsiniz. Etkinlik Panosu (event-os-board) genel durumu özetleyebilir.

Önemli not: Yanıt gelmiyorsa davetlinin iletişim bilgisini ve ortak linkin doğru plana bağlı olduğunu kontrol edin.`,
  ),
  faq(
    "c-seating",
    "customer",
    "Masa planı nasıl yönetilir?",
    `Ne anlama gelir: Masa planı; misafirleri masalara atayarak oturma düzenini görsel veya liste halinde yönetmenizi sağlar.

Nereye tıklarsınız: Müşteri Paneli → Masa Planı (event-os-seating). Önce masa/tablo ekleyin, ardından davetlileri masalara atayın.

Sonra ne olur: Masalar ve atamalar kaydedilir; davetli listesindeki masa bilgisi güncellenir. Plan değişikliğinde atamaları yeniden düzenleyebilirsiniz.

Önemli not: Masa planı için davetli listesinin dolu olması önerilir; önce Davetliler bölümünü tamamlayın.`,
  ),
];

const VENDOR_FAQ: FaqItem[] = [
  faq(
    "v-account",
    "vendor",
    "İşletme hesabı nasıl açılır?",
    `Ne anlama gelir: İşletme hesabı; mekan sahibi, organizasyon firması, fotoğrafçı veya catering firması gibi organizasyon hizmeti sunan taraflar içindir. Marketplace'te hizmet ilanı yayınlayıp müşterilerden teklif ve mesaj alırsınız. ORIVONA ürün satışı değil; hizmet sunumu ve teklif akışı platformudur.

Nereye tıklarsınız: Ana sayfa → İşletmeler bölümü veya Kayıt Ol (/register) ekranında hizmet sağlayıcı işletme rolünü seçin. Kayıt sonrası İşletme Paneli (/vendor/dashboard) açılır.

Sonra ne olur: Profil, hizmet ve belge bilgilerinizi doldurursunuz; ORIVONA incelemesinden sonra onaylı işletme olarak görünürsünüz. Onay öncesi bazı yayınlama özellikleri kısıtlı olabilir.

Önemli not: Müşteri ve işletme hesapları ayrıdır; aynı e-posta ile doğru rolü seçtiğinizden emin olun.`,
  ),
  faq(
    "v-approval",
    "vendor",
    "İşletme onayı nasıl çalışır?",
    `Ne anlama gelir: Onay; ORIVONA ekibinin işletme profilinizi, belgelerinizi ve hizmet uygunluğunuzu doğrulamasıdır. Onaylı işletmeler marketplace'te listelenir.

Nereye tıklarsınız: İşletme Paneli → İşletme profili (dashboard-profile). Eksik alanları tamamlayın; panel üstünde onay bekleniyor uyarısı görünebilir.

Sonra ne olur: Admin ekibi inceleyip onaylar veya geri bildirim verir. Onay sonrası hizmetleriniz aramalarda görünür ve teklif talepleri almaya başlarsınız.

Önemli not: Red veya eksik belge durumunda profil açıklamasını ve iletişim bilgilerinizi güncelleyip tekrar başvurun.`,
  ),
  faq(
    "v-listing",
    "vendor",
    "Hizmet/ilan nasıl eklenir?",
    `Ne anlama gelir: Hizmet ilanı; marketplace'te görünen teklif kartınızdır (başlık, kategori, fiyat, şehir, kapasite, açıklama).

Nereye tıklarsınız: İşletme Paneli → Hizmetlerim (dashboard-services) → Yeni hizmet ekle veya düzenle formunu açın. Kategori, şehir ve fiyat alanlarını eksiksiz doldurun.

Sonra ne olur: Kaydettiğiniz hizmet listede görünür; aktif/pasif durumunu değiştirebilirsiniz. Müşteriler bu ilan üzerinden teklif isteyebilir.

Önemli not: Pasife alınan hizmetler aramada çıkmayabilir; silme yerine pasif kullanımı tercih edin.`,
  ),
  faq(
    "v-media",
    "vendor",
    "Hizmet görselleri nasıl yönetilir?",
    `Ne anlama gelir: Görseller; ilanınızın marketplace kartında ve detay sayfasında güven oluşturan fotoğraf/video medyasıdır.

Nereye tıklarsınız: Hizmetlerim'de bir hizmeti düzenle moduna alın; aynı bölümde Hizmet Görselleri ve Gelişmiş Medya panelleri açılır.

Sonra ne olur: Kapak görseli ve ek medya yüklenir, sıralanır veya kaldırılır. Değişiklikler kaydedildikten sonra marketplace önizlemesinde yansır.

Önemli not: Büyük dosyalar yavaş yüklenebilir; yükleme bitene kadar sayfayı kapatmayın.`,
  ),
  faq(
    "v-availability",
    "vendor",
    "Müsaitlik takvimi nasıl kullanılır?",
    `Ne anlama gelir: Müsaitlik; hangi günlerin rezervasyona açık veya dolu olduğunuzu müşterilere göstermenizi sağlar.

Nereye tıklarsınız: İşletme Paneli → Müsaitlik / Takvim (dashboard-availability). Takvimde gün seçip müsait veya dolu işaretleyin.

Sonra ne olur: Müşteriler teklif isterken gerçekçi tarih beklentisi oluşur. Yoğunluk takvimi (dashboard-heatmap) ek analiz sunabilir.

Önemli not: Takvimi düzenli güncellemek gereksiz teklif reddini azaltır.`,
  ),
  faq(
    "v-offer-response",
    "vendor",
    "Gelen tekliflere nasıl cevap verilir?",
    `Ne anlama gelir: Müşteri, hizmetiniz için teklif talebi gönderdiğinde size özel fiyat ve paket sunmanız beklenir.

Nereye tıklarsınız: İşletme Paneli → Gelen Teklif Talepleri (dashboard-offers). Bekleyen talepte Fiyatlı Teklif Gönder veya Talebi Reddet düğmelerini kullanın.

Sonra ne olur: Gönderdiğiniz teklif müşteri panelinde görünür; kabul edilirse rezervasyon süreci başlar. Reddedilen talepler arşivlenir.

Önemli not: Hızlı yanıt dönüşüm oranını artırır; bildirimleri açık tutun.`,
  ),
  faq(
    "v-revise-offer",
    "vendor",
    "Revize teklif nasıl gönderilir?",
    `Ne anlama gelir: Revize teklif; ilk fiyat/koşulları güncelleyerek müşteriye yeni bir fiyatlı teklif sunmaktır (müzakere veya kapsam değişikliği).

Nereye tıklarsınız: dashboard-offers bölümünde ilgili talebi bulun → Fiyatlı Teklif Gönder modalını tekrar açın. Güncel fiyat, açıklama ve geçerlilik tarihini girin.

Sonra ne olur: Müşteri güncel teklifi Tekliflerim'de görür; eski ve yeni koşulları mesajla da açıklayabilirsiniz (dashboard-messages).

Önemli not: Her revizyonu açıklama alanında net yazın; müşteri karışıklığı yaşamaz.`,
  ),
  faq(
    "v-reservations",
    "vendor",
    "Rezervasyonlar nasıl yönetilir?",
    `Ne anlama gelir: Rezervasyonlar; onaylanmış etkinlik tarihleri ve müşteri kayıtlarınızın listesidir.

Nereye tıklarsınız: İşletme Paneli → Rezervasyonlar (dashboard-reservations). Liste boşsa önce teklif kabul süreçlerini tamamlayın.

Sonra ne olur: Rezervasyon detayında tarih, hizmet ve durum görünür; müşteriyle mesajlaşarak organizasyon detayını netleştirirsiniz.

Önemli not: Çakışan tarihler için müsaitlik takviminizi güncel tutun.`,
  ),
  faq(
    "v-messages",
    "vendor",
    "Mesajlar nasıl takip edilir?",
    `Ne anlama gelir: Müşterilerden gelen sorular ve teklif sonrası yazışmalar tek inbox'ta toplanır.

Nereye tıklarsınız: İşletme Paneli → Mesajlar (dashboard-messages). Sol listeden konuşma seçin.

Sonra ne olur: Mesaj gönderip geçmişi okursunuz; okunmamışlar vurgulanır. Yeni konuşmalar genelde müşterinin ilk mesajıyla başlar.

Önemli not: Teklif kartındaki müşteri adı ile konuşmayı eşleştirin.`,
  ),
  faq(
    "v-crm",
    "vendor",
    "CRM / lead sistemi ne işe yarar?",
    `Ne anlama gelir: CRM ve pipeline; müşteri teklif taleplerini aşamalara (yeni, görüşmede, kazanıldı vb.) ayırarak organizasyon teklif huninizi görselleştirir.

Nereye tıklarsınız: İşletme Paneli → CRM Pipeline (dashboard-pipeline) ve İşletme CRM (dashboard-crm) bölümleri.

Sonra ne olur: Kartları sütunlar arasında takip edersiniz; CRM tablosunda müşteri ve talep detaylarına bakarsınız.

Önemli not: Veri yoksa önce teklif talebi alın; pipeline boş sütun gösterebilir.`,
  ),
  faq(
    "v-analytics",
    "vendor",
    "Analitikler nasıl yorumlanır?",
    `Ne anlama gelir: Analitikler; görüntülenme, teklif, dönüşüm ve performans özetlerini göstererek hangi hizmetin daha iyi çalıştığını anlamanıza yardım eder.

Nereye tıklarsınız: İşletme Paneli → Analitik (dashboard-analytics). Grafik ve tabloları inceleyin.

Sonra ne olur: Dönemsel trendlere göre fiyat, fotoğraf veya açıklama optimizasyonu yapabilirsiniz. Yorum özeti (dashboard-review-intel) müşteri geri bildirimini tamamlar.

Önemli not: API geçici hata verirse Yenile'ye basın; veri yoksa henüz yeterli trafik olmayabilir.`,
  ),
];

const ADMIN_FAQ: FaqItem[] = [
  faq(
    "a-vendor-approve",
    "admin",
    "İşletme onayı nasıl yapılır?",
    `Ne anlama gelir: Admin olarak bekleyen işletme başvurularını inceleyip marketplace'e açma veya reddetme yetkisine sahipsiniz.

Nereye tıklarsınız: Admin Paneli (/admin/dashboard) → İşletmeler tablosu. Satırdaki Onayla veya Reddet (gerekçe modalı) düğmelerini kullanın.

Sonra ne olur: Onaylanan işletme müşterilere görünür; reddedilen işletme bilgilendirilir ve profilini düzeltebilir. Özet kartlar güncellenir.

Önemli not: Onay öncesi belge ve iletişim bilgilerini tablodan kontrol edin.`,
  ),
  faq(
    "a-categories",
    "admin",
    "Kategoriler nasıl yönetilir?",
    `Ne anlama gelir: Kategoriler; marketplace filtrelerinde ve hizmet formlarında kullanılan sınıflandırmadır (mekan, catering vb.).

Nereye tıklarsınız: Admin Paneli → Kategori yönetimi bölümü (AdminCategoryManagement). Yeni kategori ekleyin veya mevcutları düzenleyin.

Sonra ne olur: Değişiklikler yeni hizmet formlarında ve arama filtrelerinde kullanılır. Hatalı kategori hizmetlerin yanlış listede görünmesine yol açar.

Önemli not: Silme yerine pasifleştirme tercih edin; bağlı hizmetleri kontrol edin.`,
  ),
  faq(
    "a-users",
    "admin",
    "Kullanıcılar nasıl aktif/pasif yapılır?",
    `Ne anlama gelir: Kullanıcı yönetimi; hesabı geçici olarak devre dışı bırakarak giriş ve işlem yapmasını engellemektir.

Nereye tıklarsınız: Admin Paneli → Kullanıcı yönetimi (AdminUserManagement). İlgili kullanıcı satırında aktif et / pasif et aksiyonunu kullanın.

Sonra ne olur: Pasif kullanıcı oturum açamaz; aktif edilince normale döner. İşlem sonrası liste yenilenir.

Önemli not: Yanlışlıkla kendi admin hesabınızı pasifleştirmeyin.`,
  ),
  faq(
    "a-badges",
    "admin",
    "Badge / premium / öne çıkarma nasıl yönetilir?",
    `Ne anlama gelir: Rozet ve öne çıkarma; güvenilir işletme, premium veya editoryal görünürlük için işletme ve hizmet kartlarına meta veri eklemenizi sağlar.

Nereye tıklarsınız: Admin Paneli → İşletmeler veya Hizmetler tablosunda satırı genişletin → Badge / Premium kontrolleri (AdminBadgeControls). Hizmetler için ayrıca öne çıkar (feature) düğmesi olabilir.

Sonra ne olur: Seçilen rozetler marketplace kartlarında görünür; öne çıkan hizmetler listelerde üst sıralara yaklaşabilir.

Önemli not: Değişiklikler anında UI'da yansır; politika kurallarınıza göre tutarlı kullanın.`,
  ),
];

export const FAQ_SECTIONS: FaqSection[] = [
  {
    category: "customer",
    label: "Müşteriler",
    description: "Etkinlik planlama, marketplace, teklif, davetli ve QR süreçleri",
    items: CUSTOMER_FAQ,
  },
  {
    category: "vendor",
    label: "İşletmeler",
    description: "Hesap, ilan, müsaitlik, teklif ve CRM süreçleri",
    items: VENDOR_FAQ,
  },
  {
    category: "admin",
    label: "Yöneticiler",
    description: "Onay, kategori, kullanıcı ve rozet yönetimi",
    items: ADMIN_FAQ,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  ...CUSTOMER_FAQ,
  ...VENDOR_FAQ,
  ...ADMIN_FAQ,
];

const FAQ_BY_ID = new Map(FAQ_ITEMS.map((item) => [item.id, item]));

export function getFaqItemsByIds(ids: string[]): FaqItem[] {
  return ids
    .map((id) => FAQ_BY_ID.get(id))
    .filter((item): item is FaqItem => item != null);
}

/** Topic groups for the dedicated /faq page. */
export type FaqPageSection = {
  id: string;
  label: string;
  description: string;
  itemIds: string[];
};

export const FAQ_PAGE_SECTIONS: FaqPageSection[] = [
  {
    id: "customers",
    label: "Müşteriler",
    description: "Keşif, etkinlik planı ve müşteri paneli",
    itemIds: [
      "c-what",
      "c-create-event",
      "c-marketplace-search",
      "c-favorites",
      "c-messaging",
    ],
  },
  {
    id: "vendors",
    label: "İşletmeler",
    description: "İlan, müsaitlik, mesajlaşma ve işletme paneli",
    itemIds: [
      "v-account",
      "v-approval",
      "v-listing",
      "v-media",
      "v-availability",
      "v-messages",
      "v-crm",
      "v-analytics",
    ],
  },
  {
    id: "offers-reservations",
    label: "Rezervasyon & Teklif",
    description: "Teklif isteme, kabul ve rezervasyon akışları",
    itemIds: [
      "c-request-offer",
      "c-reservation",
      "v-offer-response",
      "v-revise-offer",
      "v-reservations",
    ],
  },
  {
    id: "invite-qr",
    label: "Davetiye & QR",
    description: "Davetli listesi, RSVP, ortak link ve QR bilet",
    itemIds: [
      "c-guest-list",
      "c-public-invite",
      "c-qr-invite",
      "c-rsvp-track",
      "c-seating",
    ],
  },
  {
    id: "ai-planner",
    label: "AI Planlayıcı",
    description: "Yapay zeka destekli etkinlik planı ve öneriler",
    itemIds: ["c-ai-planner"],
  },
  {
    id: "account-security",
    label: "Hesap & Güvenlik",
    description: "Hesap rolleri, onay süreçleri ve platform yönetimi",
    itemIds: ["a-vendor-approve", "a-categories", "a-users", "a-badges"],
  },
];
