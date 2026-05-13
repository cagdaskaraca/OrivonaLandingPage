import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "ORIVONA — AI Destekli Organizasyon Platformu";
const siteDescription =
  "Düğün, nişan ve kurumsal etkinlikler için ORIVONA: AI destekli organizasyon planlaması, doğrulanmış hizmet sağlayıcıları ve güvenli rezervasyon. Teklif alın, rezervasyon yapın, tedarikçi pazarını tek panelden yönetin.";

export const metadata: Metadata = {
  applicationName: "ORIVONA",
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [{ url: "/orivona-logo.ico", type: "image/x-icon" }],
    shortcut: "/orivona-logo.ico",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "tr_TR",
    siteName: "ORIVONA",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
