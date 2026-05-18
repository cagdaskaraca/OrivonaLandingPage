import type { MetadataRoute } from "next";
import { SITE_CANONICAL_URL } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_CANONICAL_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
