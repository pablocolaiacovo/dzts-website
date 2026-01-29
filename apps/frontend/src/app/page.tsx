import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";
import MapSection from "@/components/MapSection";

const CITIES_QUERY = defineQuery(`
  *[_type == "city"] | order(name asc) { name, "slug": slug.current }
`);

const PROPERTY_TYPES_QUERY = defineQuery(`
  *[_type == "propertyTypeCategory"] | order(name asc) { name, "slug": slug.current }
`);

const ROOM_COUNTS_QUERY = defineQuery(`
  array::unique(*[_type == "property" && defined(rooms)].rooms) | order(@ asc)
`);

const MAP_ADDRESS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0].address
`);

export default async function Home() {
  const [{ data: cities }, { data: propertyTypes }, { data: roomCounts }, { data: address }] =
    await Promise.all([
      sanityFetch({ query: CITIES_QUERY }),
      sanityFetch({ query: PROPERTY_TYPES_QUERY }),
      sanityFetch({ query: ROOM_COUNTS_QUERY }),
      sanityFetch({ query: MAP_ADDRESS_QUERY }),
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
