import { Suspense } from "react";
import { ServiceDetailView } from "@/src/components/app/ServiceDetailView";

export const metadata = {
  title: "Hizmet Detayı | ORIVONA",
};

export default function ServiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-400">
          Yükleniyor…
        </div>
      }
    >
      <ServiceDetailView />
    </Suspense>
  );
}
