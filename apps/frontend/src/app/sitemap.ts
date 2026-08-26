import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { buildFilterCombos } from "@/lib/filterRoutes";

export const dynamic = "force-static";

interface PropertyRow {
  slug: string;
  _updatedAt: string;
  operationType: string | null;
  typeSlug: string | null;
  citySlug: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return [];
  }

  const properties = await client.fetch<PropertyRow[]>(`
    *[_type == "property" && defined(slug.current) && published != false] {
      "slug": slug.current,
      _updatedAt,
      operationType,
      "typeSlug": propertyType->slug.current,
      "citySlug": city->slug.current
    }
  `);

  const propertyUrls: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/propiedades/${property.slug}`,
    lastModified: new Date(property._updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const comboUrls: MetadataRoute.Sitemap = buildFilterCombos(properties).map(
    (segments) => ({
      url: `${baseUrl}/propiedades/${segments.join("/")}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyUrls,
    ...comboUrls,
  ];
}
