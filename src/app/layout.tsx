import type { Metadata, Viewport } from "next";
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

const defaultTitle = "ORIVONA | AI Destekli Organizasyon Platformu";
const defaultDescription =
  "Premium etkinlik deneyimleri için AI destekli modern organizasyon platformu.";

const ogTitle = "ORIVONA — AI Destekli Organizasyon Platformu";
const ogDescription =
  "Düğün, nişan ve kurumsal etkinlikler için AI destekli organizasyon planlaması, doğrulanmış hizmet sağlayıcıları ve güvenli rezervasyon.";

const ogImageAbsolute = `${SITE_URL}/orivona-logo.png`;

// Google Search Console: when you have a real verification token from Google, add to `metadata` below:
//   verification: { google: "paste_token_here" }
// Do not use a placeholder or invented value in production.

export const viewport: Viewport = {
  themeColor: "#0B0614",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "ORIVONA",
  title: defaultTitle,
  description: defaultDescription,
  keywords: [
    "organizasyon platformu",
    "düğün planlama",
    "nişan organizasyonu",
    "kurumsal etkinlik",
    "etkinlik yönetimi",
    "organizasyon marketplace",
    "ORIVONA",
  ],
  authors: [{ name: "ORIVONA", url: SITE_URL }],
  creator: "ORIVONA",
  publisher: "ORIVONA",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/orivona-logo.png", type: "image/png" },
      { url: "/orivona-logo.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: "/orivona-logo.ico",
    apple: "/orivona-logo.png",
  },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: SITE_URL,
    siteName: "ORIVONA",
    type: "website",
    locale: "tr_TR",
    images: [
      {
        url: ogImageAbsolute,
        secureUrl: ogImageAbsolute,
        width: 320,
        height: 96,
        alt: ogTitle,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [ogImageAbsolute],
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
