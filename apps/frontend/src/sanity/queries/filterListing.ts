import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "./properties";
import { getCachedFilterPageSeo } from "./filterPageSeo";
import { buildFilterOptions } from "@/lib/filters";
import type { PropertyListItem } from "@/components/PropertiesListing";

export const ALL_PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && defined(slug.current) && published != false]
    | order(publishedAt desc) {
    _id, title, "slug": slug.current, subtitle, price, currency,
    operationType, status,
    "propertyType": propertyType->name,
    "propertyTypeSlug": propertyType->slug.current,
    "city": city->name,
    "citySlug": city->slug.current,
    rooms, sizeTotal, size, reference,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }
`);

interface RawProperty extends Omit<PropertyListItem, "lqip"> {
  image?: {
    asset?: { metadata?: { lqip?: string | null } | null } | null;
  } | null;
}

export async function getFilterListingData() {
  const [{ data: rawProperties }, cities, propertyTypes, roomCounts, seoEntries] =
    await Promise.all([
      sanityFetch({ query: ALL_PROPERTIES_QUERY }),
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedFilterPageSeo(),
    ]);

  const properties: PropertyListItem[] = ((rawProperties || []) as RawProperty[]).map(
    (property) => ({
      ...property,
      lqip: property.image?.asset?.metadata?.lqip ?? null,
    }),
  );

  return {
    properties,
    filterOptions: buildFilterOptions(cities, propertyTypes, roomCounts),
    seoEntries,
  };
}
