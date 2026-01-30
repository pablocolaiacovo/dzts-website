import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import { getCachedHomeSections } from "@/sanity/queries/homePage";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";
import MapSection from "@/components/MapSection";
import { buildFilterOptions } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Encontrá la propiedad a medida. Buscá casas, departamentos y terrenos en venta y alquiler con DZTS Inmobiliaria.",
};

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
  const [cities, propertyTypes, roomCounts, address, sections] =
    await Promise.all([
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedMapAddress(),
      getCachedHomeSections(),
    ]);

  const filterOptions = buildFilterOptions(cities, propertyTypes, roomCounts);

  return (
    <>
      <SearchProperties filterOptions={filterOptions} />
      <FeaturedProperties />
      {sections?.map((section, index) => (
        <TextImageSection key={index} index={index} {...section} />
      ))}
      <MapSection address={address} />
    </>
  );
}
