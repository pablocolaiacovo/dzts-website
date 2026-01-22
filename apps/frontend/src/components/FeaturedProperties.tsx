import PropertyCard from './PropertyCard';
import { defineQuery } from 'next-sanity';
import { sanityFetch } from '@/sanity/lib/live';

interface Property {
  title: string;
  slug: string;
  subtitle: string | null;
  price: number | null;
  image: string | null;
  operationType: string | null;
}

const FEATURED_QUERY = defineQuery(`*
  [_type == "property" && featured == true] 
  | order(publishedAt desc)[0...6] 
  {
    title,
    "slug": slug.current,
    subtitle,
    price,
    operationType,
    "image": images[0]
  }`
);

export default async function FeaturedProperties() {
  const { data: properties } = await sanityFetch({ query: FEATURED_QUERY });

  return (
    <div className="container py-4">
      <h1 className="text-center mb-5 fw-bold">Propiedades Destacadas</h1>
      <div className="row justify-content-center">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property.slug} className="col-12 col-md-4 d-flex justify-content-center mb-4">
              <PropertyCard
                title={property.title}
                slug={property.slug}
                subtitle={property.subtitle ?? undefined}
                price={property.price ?? undefined}
                image={property.image ?? undefined}
                operationType={property.operationType ?? undefined}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No hay propiedades disponibles</p>
        )}
      </div>
    </div>
  );
}