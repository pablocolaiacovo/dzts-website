import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";

export default async function Home() {
  const [cities, propertyTypes, roomCounts] = await Promise.all([
    getCachedCities(),
    getCachedPropertyTypes(),
    getCachedRoomCounts(),
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
    </>
  );
}
