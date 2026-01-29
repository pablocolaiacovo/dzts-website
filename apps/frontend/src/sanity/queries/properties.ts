import { defineQuery } from "next-sanity";
import { cacheLife } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";

export const CITIES_QUERY = defineQuery(`
  *[_type == "city"] | order(name asc) { name, "slug": slug.current }
`);

export const PROPERTY_TYPES_QUERY = defineQuery(`
  *[_type == "propertyTypeCategory"] | order(name asc) { name, "slug": slug.current }
`);

export const ROOM_COUNTS_QUERY = defineQuery(`
  array::unique(*[_type == "property" && defined(rooms)].rooms) | order(@ asc)
`);

export async function getCachedCities() {
  "use cache";
  cacheLife("minutes");
  const { data } = await sanityFetch({ query: CITIES_QUERY });
  return data;
}

export async function getCachedPropertyTypes() {
  "use cache";
  cacheLife("minutes");
  const { data } = await sanityFetch({ query: PROPERTY_TYPES_QUERY });
  return data;
}

export async function getCachedRoomCounts() {
  "use cache";
  cacheLife("minutes");
  const { data } = await sanityFetch({ query: ROOM_COUNTS_QUERY });
  return data;
}
