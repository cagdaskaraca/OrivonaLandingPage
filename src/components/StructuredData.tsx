import { SITE_URL } from "@/src/lib/site";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ORIVONA",
  url: SITE_URL,
  logo: `${SITE_URL}/orivona-logo.png`,
  description:
    "Düğün, nişan ve kurumsal etkinlikler için AI destekli organizasyon planlaması, doğrulanmış hizmet sağlayıcıları ve güvenli rezervasyon sistemi.",
} as const;

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ORIVONA",
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: "ORIVONA",
    url: SITE_URL,
  },
} as const;

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
