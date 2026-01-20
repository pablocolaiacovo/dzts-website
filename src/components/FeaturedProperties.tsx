import { client } from '@/sanity/lib/client';
import PropertyCard from './PropertyCard';

interface Property {
  title: string;
  slug: string;
  subtitle: string | null;
  price: number | null;
  imageUrl: string | null;
  operationType: string | null;
}

const FEATURED_QUERY = `
  *[_type == "property"] | order(publishedAt desc)[0...6] {
    title,
    "slug": slug.current,
    subtitle,
    price,
    operationType,
    "imageUrl": images[0].asset->url
  }
`;

export default async function FeaturedProperties() {
  const properties = await client.fetch<Property[]>(FEATURED_QUERY);

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
                imageUrl={property.imageUrl ?? undefined}
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