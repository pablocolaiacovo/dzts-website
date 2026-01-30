import { defineQuery } from "next-sanity";
import { cacheLife } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";

export const HOME_SECTIONS_QUERY = defineQuery(`
  *[_type == "homePage"][0].sections[]{
    _key,
    title,
    anchorId,
    content,
    imagePosition,
    backgroundColor,
    images[]{ asset->{ url, metadata { lqip } }, alt }
  }
`);

export async function getCachedHomeSections() {
  "use cache";
  cacheLife("minutes");
  const { data } = await sanityFetch({ query: HOME_SECTIONS_QUERY });
  return data;
}

const HOME_CONTENT_QUERY = defineQuery(`
  *[_type == "homePage"][0] {
    heroHeading,
    heroImage { asset->{ url, metadata { lqip } } },
    heroLogo { asset->{ url, metadata { lqip, dimensions } }, alt },
    featuredPropertiesHeading
  }
`);

export async function getCachedHomeContent() {
  "use cache";
  cacheLife("hours");
  const { data } = await sanityFetch({ query: HOME_CONTENT_QUERY });
  return data;
}
