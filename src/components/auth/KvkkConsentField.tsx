"use client";

import { useState } from "react";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

const KVKK_PLACEHOLDER = `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, ORIVONA olarak kişisel verileriniz; üyelik işlemlerinizin yürütülmesi, hizmet sunumu, müşteri ilişkileri yönetimi, güvenlik, hukuki yükümlülüklerin yerine getirilmesi ve meşru menfaatlerimizin korunması amaçlarıyla işlenmektedir.

İşlenen veri kategorileri; kimlik, iletişim, müşteri işlem, işlem güvenliği ve pazarlama tercihlerinize ilişkin bilgileri kapsayabilir. Verileriniz; kanunen yetkili kamu kurum ve kuruluşları ile hizmet aldığımız iş ortaklarına, KVKK’nın 8. ve 9. maddelerinde öngörülen şartlara uygun olarak aktarılabilir.

KVKK’nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve kanunda öngörülen diğer haklara sahipsiniz.

Detaylı bilgi ve başvurularınız için: kvkk@orivona.com

Bu metin bilgilendirme amaçlıdır; güncel aydınlatma metni yayımlandığında bu alan güncellenecektir.`;

type KvkkConsentFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function KvkkConsentField({ checked, onChange }: KvkkConsentFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

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

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-labelledby="kvkk-modal-title"
        >
          <div
            className={`${glassCard} flex max-h-[90vh] w-full max-w-lg flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="kvkk-modal-title"
              className="mb-4 text-lg font-semibold text-white"
            >
              KVKK Aydınlatma Metni
            </h2>
            <div className="orivona-scroll-y min-h-0 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
              {KVKK_PLACEHOLDER}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  onChange(true);
                  setModalOpen(false);
                }}
              >
                Onaylıyorum
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setModalOpen(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
