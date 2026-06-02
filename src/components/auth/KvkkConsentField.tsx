"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { btnPrimary, btnSecondary } from "@/src/lib/ui";

type KvkkSection = {
  title: string;
  paragraphs: string[];
};

const KVKK_SECTIONS: KvkkSection[] = [
  {
    title: "Veri sorumlusu ve işleme amaçları",
    paragraphs: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, ORIVONA olarak kişisel verileriniz; üyelik işlemlerinizin yürütülmesi, hizmet sunumu, müşteri ilişkileri yönetimi, güvenlik, hukuki yükümlülüklerin yerine getirilmesi ve meşru menfaatlerimizin korunması amaçlarıyla işlenmektedir.",
    ],
  },
  {
    title: "İşlenen veri kategorileri ve aktarım",
    paragraphs: [
      "İşlenen veri kategorileri; kimlik, iletişim, müşteri işlem, işlem güvenliği ve pazarlama tercihlerinize ilişkin bilgileri kapsayabilir.",
      "Verileriniz; kanunen yetkili kamu kurum ve kuruluşları ile hizmet aldığımız iş ortaklarına, KVKK’nın 8. ve 9. maddelerinde öngörülen şartlara uygun olarak aktarılabilir.",
    ],
  },
  {
    title: "Haklarınız",
    paragraphs: [
      "KVKK’nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve kanunda öngörülen diğer haklara sahipsiniz.",
    ],
  },
  {
    title: "İletişim",
    paragraphs: [
      "Detaylı bilgi ve başvurularınız için: kvkk@orivona.com",
    ],
  },
];

const KVKK_FOOTNOTE =
  "Bu metin bilgilendirme amaçlıdır; güncel aydınlatma metni yayımlandığında bu alan güncellenecektir.";

type KvkkConsentFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function KvkkModal({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-[9000]"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9010] flex items-center justify-center p-4 pointer-events-none sm:p-6">
        <div
          role="dialog"
          aria-modal
          aria-labelledby="kvkk-modal-title"
          className="pointer-events-auto flex w-full max-w-[720px] max-h-[85vh] flex-col overflow-hidden rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)]"
          style={{
            backgroundColor: "rgba(12, 8, 24, 0.98)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
          }}
        >
          <header
            className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"
            style={{
              backgroundColor: "rgba(12, 8, 24, 0.98)",
              borderColor: "rgba(168, 85, 247, 0.2)",
            }}
          >
            <h2
              id="kvkk-modal-title"
              className="text-base font-semibold tracking-tight text-white sm:text-lg"
            >
              KVKK Aydınlatma Metni
            </h2>
            <button
              type="button"
              className="shrink-0 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-500/25 sm:px-4 sm:text-sm"
              onClick={onClose}
              aria-label="Kapat"
            >
              Kapat
            </button>
          </header>

          <div className="orivona-scroll-y min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {KVKK_SECTIONS.map((section) => (
              <section key={section.title} className="mb-8 last:mb-4">
                <h3 className="mb-3 text-sm font-semibold text-violet-100/95">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="text-sm leading-7 text-zinc-300/95"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <p className="mt-2 border-t border-white/[0.06] pt-4 text-xs leading-6 text-zinc-500">
              {KVKK_FOOTNOTE}
            </p>
          </div>

          <footer
            className="flex shrink-0 flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
            style={{
              backgroundColor: "rgba(12, 8, 24, 0.98)",
              borderColor: "rgba(168, 85, 247, 0.2)",
            }}
          >
            <button type="button" className={btnPrimary} onClick={onAccept}>
              Onaylıyorum
            </button>
            <button type="button" className={btnSecondary} onClick={onClose}>
              Kapat
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}

export function KvkkConsentField({ checked, onChange }: KvkkConsentFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function closeModal() {
    setModalOpen(false);
  }

  function acceptModal() {
    onChange(true);
    setModalOpen(false);
  }

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-zinc-300">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.06] accent-violet-400"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          <button
            type="button"
            className="text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
          >
            KVKK Aydınlatma Metni
          </button>
          ’ni okudum ve onaylıyorum.
        </span>
      </label>

      {mounted && modalOpen
        ? createPortal(
            <KvkkModal onClose={closeModal} onAccept={acceptModal} />,
            document.body,
          )
        : null}
    </>
  );
}
