import { SITE_SEO_DESCRIPTION } from "@/src/lib/seo";
import { SITE_URL } from "@/src/lib/site";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ORIVONA",
  url: SITE_URL,
  logo: `${SITE_URL}/orivona-logo.png`,
  description: SITE_SEO_DESCRIPTION,
} as const;

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ORIVONA",
  url: SITE_URL,
  description: SITE_SEO_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "ORIVONA",
    url: SITE_URL,
    logo: `${SITE_URL}/orivona-logo.png`,
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
