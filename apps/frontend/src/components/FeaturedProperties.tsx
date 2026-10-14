import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { FEATURED_QUERY_RESULT } from "@/sanity/types";
import PropertyCard from "./PropertyCard";

const FEATURED_QUERY = defineQuery(`
  *[_type == "homePage"][0].featuredProperties[]->{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    price,
    currency,
    operationType,
    status,
    published,
    rooms,
    "city": city->name,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }`);

const FEATURED_IMAGE_SIZES =
  "(min-width: 1400px) 400px, (min-width: 1200px) 356px, (min-width: 992px) 296px, (min-width: 768px) 336px, (min-width: 424px) 400px, calc(100vw - 24px)";

export default async function FeaturedProperties({
  heading,
}: {
  heading: string;
}) {
  const { data } = (await sanityFetch({ query: FEATURED_QUERY })) as {
    data: FEATURED_QUERY_RESULT | null;
  };

  // Preserve the manual order and the author's selection from the Studio.
  // Only hide unpublished properties (they have no detail page, so their card
  // would link to a 404); sold/rented featured properties still show, with
  // their status ribbon.
  const properties = (data ?? [])
    .filter((property) => property.published !== false)
    .slice(0, 6);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-5 fw-bold">{heading}</h2>
      <div className="row justify-content-center g-4">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div
              key={property._id}
              className="col-12 col-md-6 col-lg-4 d-flex justify-content-center"
            >
              <PropertyCard
                title={property.title}
                slug={property.slug}
                subtitle={property.subtitle}
                price={property.price}
                currency={property.currency}
                operationType={property.operationType}
                status={property.status}
                image={property.image}
                lqip={property.image?.asset?.metadata?.lqip}
                rooms={property.rooms}
                city={property.city}
                imageSizes={FEATURED_IMAGE_SIZES}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-muted">
            No hay propiedades disponibles
          </p>
        )}
      </div>
    </div>
  );
}
