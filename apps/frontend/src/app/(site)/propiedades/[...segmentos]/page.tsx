import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { getAllPropertySlugs } from "@/sanity/queries/propertyDetail";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import { resolveMetadata } from "@/lib/seo";
import { parseSegments, buildFilterCombos, type KnownSlugs } from "@/lib/filterRoutes";
import { buildFilterSeoDefaults, findFilterSeoOverride } from "@/lib/filterSeo";
import PropertyDetail, { buildPropertyMetadata } from "@/components/PropertyDetail";
import PropertiesListing from "@/components/PropertiesListing";
import FilteredListingIntro from "@/components/FilteredListingIntro";
import { getFilterListingData } from "@/sanity/queries/filterListing";

const FILTER_FACETS_QUERY = defineQuery(`{
  "types": *[_type == "propertyTypeCategory" && defined(slug.current)].slug.current,
  "cities": *[_type == "city" && defined(slug.current)].slug.current,
  "comboSource": *[_type == "property" && published != false]{
    operationType,
    "typeSlug": propertyType->slug.current,
    "citySlug": city->slug.current
  }
}`);

async function getKnownSlugs(): Promise<KnownSlugs> {
  const { data } = await sanityFetch({ query: FILTER_FACETS_QUERY });
  return {
    types: new Set((data?.types ?? []).filter(Boolean) as string[]),
    cities: new Set((data?.cities ?? []).filter(Boolean) as string[]),
  };
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({ query: FILTER_FACETS_QUERY });
  const slugEntries = await getAllPropertySlugs();
  const propertySlugs = slugEntries.map((e) => e.slug);

  const reserved = new Set<string>([
    "venta",
    "alquiler",
    ...((data?.types ?? []).filter(Boolean) as string[]),
    ...((data?.cities ?? []).filter(Boolean) as string[]),
  ]);
  for (const slug of propertySlugs) {
    if (reserved.has(slug)) {
      throw new Error(
        `[rutas-filtro] El slug de propiedad "${slug}" colisiona con un slug de operación/tipo/ciudad. Renombralo en Sanity.`,
      );
    }
  }

  const combos = buildFilterCombos(data?.comboSource ?? []);

  return [
    ...propertySlugs.map((slug) => ({ segmentos: [slug] })),
    ...combos.map((segmentos) => ({ segmentos })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segmentos: string[] }>;
}): Promise<Metadata> {
  const { segmentos } = await params;
  const known = await getKnownSlugs();
  const filters = parseSegments(segmentos, known);

  if (!filters) {
    if (segmentos.length === 1) return buildPropertyMetadata(segmentos[0]);
    return {};
  }

  const { seoEntries, filterOptions } = await getFilterListingData();
  const siteSeo = await getCachedSiteSeo();
  const labels = {
    typeNameBySlug: Object.fromEntries(filterOptions.propertyTypes.map((t) => [t.slug, t.name])),
    cityNameBySlug: Object.fromEntries(filterOptions.cities.map((c) => [c.slug, c.name])),
  };
  const defaults = buildFilterSeoDefaults(filters, labels);
  const override = findFilterSeoOverride(seoEntries, filters);

  return resolveMetadata(override?.seo ?? null, siteSeo, {
    title: defaults.title,
    description: defaults.description,
    canonicalUrl: defaults.canonicalUrl,
  });
}

export default async function PropiedadesSegmentos({
  params,
}: {
  params: Promise<{ segmentos: string[] }>;
}) {
  const { segmentos } = await params;
  const known = await getKnownSlugs();
  const filters = parseSegments(segmentos, known);

  if (!filters) {
    if (segmentos.length === 1) {
      return <PropertyDetail slug={segmentos[0]} />;
    }
    notFound();
  }

  const { properties, filterOptions, seoEntries } = await getFilterListingData();
  const labels = {
    typeNameBySlug: Object.fromEntries(filterOptions.propertyTypes.map((t) => [t.slug, t.name])),
    cityNameBySlug: Object.fromEntries(filterOptions.cities.map((c) => [c.slug, c.name])),
  };
  const defaults = buildFilterSeoDefaults(filters, labels);
  const override = findFilterSeoOverride(seoEntries, filters);

  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <FilteredListingIntro
        filters={filters}
        h1={defaults.h1}
        typeName={filters.typeSlug ? labels.typeNameBySlug[filters.typeSlug] ?? null : null}
        cityName={filters.citySlug ? labels.cityNameBySlug[filters.citySlug] ?? null : null}
        intro={override?.intro ?? null}
      />
      <PropertiesListing
        properties={properties}
        filterOptions={filterOptions}
        routeFilters={filters}
      />
    </main>
  );
}
