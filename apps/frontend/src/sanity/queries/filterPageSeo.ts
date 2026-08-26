import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { FilterSeoEntry } from "@/lib/filterSeo";

const FILTER_PAGE_SEO_QUERY = defineQuery(`
  *[_type == "filterPageSeo"]{
    operation,
    "typeSlug": propertyType->slug.current,
    "citySlug": city->slug.current,
    intro,
    seo {
      metaTitle,
      metaDescription,
      ogImage { asset->{ url } },
      noIndex
    }
  }
`);

export async function getCachedFilterPageSeo(): Promise<FilterSeoEntry[]> {
  const { data } = await sanityFetch({ query: FILTER_PAGE_SEO_QUERY });
  return (data ?? []) as unknown as FilterSeoEntry[];
}
