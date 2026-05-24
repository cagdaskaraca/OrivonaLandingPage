import { Suspense } from "react";
import { CustomerDashboardView } from "@/src/components/app/CustomerDashboardView";

export const metadata = {
  title: "Müşteri Paneli | ORIVONA",
};

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
          Yükleniyor…
        </div>
      }
    >
      <CustomerDashboardView />
    </Suspense>
  );
}
