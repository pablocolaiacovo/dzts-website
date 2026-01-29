import { cacheLife } from "next/cache";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";
import MapSection from "@/components/MapSection";

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
  const [cities, propertyTypes, roomCounts, address] = await Promise.all([
    getCachedCities(),
    getCachedPropertyTypes(),
    getCachedRoomCounts(),
    getCachedMapAddress(),
  ]);

  const filterOptions = {
    cities: (cities || []).filter(
      (c): c is { name: string; slug: string } => c.name !== null && c.slug !== null
    ),
    propertyTypes: (propertyTypes || []).filter(
      (t): t is { name: string; slug: string } => t.name !== null && t.slug !== null
    ),
    roomCounts: (roomCounts || []).filter(
      (r: number | null): r is number => r !== null && r !== undefined
    ),
  };

  return (
    <>
      <SearchProperties filterOptions={filterOptions} />
      <FeaturedProperties />
      <TextImageSection
        title="Nosotros"
        mainParagraph="Este es el párrafo principal que aparece debajo del título."
        subtitle="dzts inmobiliaria"
        paragraphs={[
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
          "Más texto de ejemplo para la sección.",
        ]}
        image="/Images/backgroun.jpg"
        backgroundColor="var(--bs-primary)"
      />
      <MapSection address={address} />
    </>
  );
}
