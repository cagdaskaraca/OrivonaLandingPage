import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { GoogleAnalyticsRouteListener } from "@/src/components/GoogleAnalyticsRouteListener";
import { StructuredData } from "@/src/components/StructuredData";
import { GA_MEASUREMENT_ID } from "@/src/lib/analytics";
import { SITE_URL } from "@/src/lib/site";
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
  "ORIVONA; düğün, nişan, doğum günü ve kurumsal etkinlikler için doğrulanmış hizmet sağlayıcıları keşfetmenizi, teklif almanızı ve organizasyon sürecinizi tek platformdan yönetmenizi sağlayan AI destekli organizasyon marketplace platformudur.";

// Google Search Console: when you have a real verification token from Google, add to `metadata` below:
//   verification: { google: "paste_token_here" }
// Do not use a placeholder or invented value in production.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "ORIVONA",
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "organizasyon platformu",
    "düğün planlama",
    "nişan organizasyonu",
    "doğum günü organizasyonu",
    "etkinlik yönetimi",
    "organizasyon marketplace",
    "ORIVONA",
  ],
  authors: [{ name: "ORIVONA", url: SITE_URL }],
  creator: "ORIVONA",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/orivona-logo.ico", type: "image/x-icon" }],
    shortcut: "/orivona-logo.ico",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: SITE_URL,
    siteName: "ORIVONA",
    type: "website",
    locale: "tr_TR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ORIVONA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
      <body className="min-h-full flex flex-col font-sans">
        <StructuredData />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Suspense fallback={null}>
          <GoogleAnalyticsRouteListener />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
