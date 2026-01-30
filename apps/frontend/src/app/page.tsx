import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import {
  getCachedHomeSections,
  getCachedHomeContent,
} from "@/sanity/queries/homePage";
import { getCachedHomeSeo, getCachedSiteSeo } from "@/sanity/queries/seo";
import { resolveMetadata } from "@/lib/seo";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";
import MapSection from "@/components/MapSection";
import { buildFilterOptions } from "@/lib/filters";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, siteSeo] = await Promise.all([
    getCachedHomeSeo(),
    getCachedSiteSeo(),
  ]);

  return resolveMetadata(pageSeo, siteSeo);
}

const MAP_ADDRESS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0].address
`);

async function getCachedMapAddress() {
  "use cache";
  cacheLife("hours");
  const { data } = await sanityFetch({ query: MAP_ADDRESS_QUERY });
  return data;
}

export default async function Home() {
  const [cities, propertyTypes, roomCounts, address, sections, homeContent] =
    await Promise.all([
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedMapAddress(),
      getCachedHomeSections(),
      getCachedHomeContent(),
    ]);

  const filterOptions = buildFilterOptions(cities, propertyTypes, roomCounts);

  return (
    <>
      <SearchProperties
        filterOptions={filterOptions}
        heroHeading={homeContent!.heroHeading!}
        heroImageUrl={homeContent!.heroImage!.asset!.url!}
        heroImageLqip={homeContent!.heroImage!.asset!.metadata?.lqip}
        heroLogoUrl={homeContent!.heroLogo!.asset!.url!}
        heroLogoAlt={homeContent!.heroLogo!.alt}
      />
      <FeaturedProperties heading={homeContent!.featuredPropertiesHeading!} />
      {sections?.map((section, index) => (
        <TextImageSection
          key={section?._key ?? index}
          index={index}
          {...section}
        />
      ))}
      <MapSection address={address} />
    </>
  );
}
