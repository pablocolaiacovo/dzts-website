import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

interface PropertySlug {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const properties = await client.fetch<PropertySlug[]>(`
    *[_type == "property" && defined(slug.current) && !(status in ["vendido", "alquilado"])] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  const propertyUrls: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/propiedades/${property.slug}`,
    lastModified: new Date(property._updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
