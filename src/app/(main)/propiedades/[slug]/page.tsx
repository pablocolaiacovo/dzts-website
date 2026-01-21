import { client } from '@/sanity/lib/client';
import ImageCarousel from '@/components/ImageCarousel';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';

interface Property {
  title: string;
  subtitle: string | null;
  address: string;
  description: Array<{ _type: string; children?: Array<{ text: string }> }> | null;
  price: number | null;
  images: string[];
  propertyType: string | null;
  operationType: string | null;
  currency: string | null;
  city: string | null;
}

const PROPERTY_QUERY = `
  *[_type == "property" && slug.current == $slug][0] {
    title,
    subtitle,
    address,
    description,
    price,
    propertyType,
    operationType,
    currency,
    city,
    "images": images[].asset->url
  }
`;

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await client.fetch<Property | null>(PROPERTY_QUERY, { slug });

  if (!property) {
    notFound();
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h1 className="text-secondary mb-2" style={{ fontSize: '2.5rem' }}>
            {property.title}
          </h1>
          <div className="d-flex gap-2 mb-2">
            {property.operationType && (
              <span className={`badge rounded-pill fs-6 ${property.operationType === 'venta' ? 'bg-success' : 'bg-warning text-dark'}`}>
                {property.operationType === 'venta' ? 'Venta' : 'Alquiler'}
              </span>
            )}
            {property.propertyType && (
              <span className="badge rounded-pill bg-info text-white fs-6 text-capitalize">
                {property.propertyType}
              </span>
            )}
          </div>

          <div className="text-primary mb-3" style={{ fontSize: '1.1rem' }}>
            {property.subtitle && <div>{property.subtitle}</div>}
            <div>
              {property.address}
              {property.address && property.city && ', '}
              {property.city && <span className="text-capitalize">{property.city.replace('-', ' ')}</span>}
            </div>
          </div>
          <hr className="border-primary mb-4" />

          <ImageCarousel images={property.images ?? []} title={property.title} />
          {property.description && (
            <div className="mb-5">
              <PortableText value={property.description} />
            </div>
          )}

          <hr className="border-secondary my-4" />
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <span className="text-primary fw-bold fs-3 fs-md-1" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              {property.price != null
                ? `${property.currency === 'ARS' ? 'ARS' : 'USD'} $${property.price.toLocaleString()}`
                : 'Consultar precio'}
            </span>
            <button className="btn btn-info text-white px-4 py-2 fw-bold w-100 w-md-auto" style={{ maxWidth: '300px' }}>
              contactate con <span className="fw-bold">dzts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
