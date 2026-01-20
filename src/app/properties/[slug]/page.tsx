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
}

const PROPERTY_QUERY = `
  *[_type == "property" && slug.current == $slug][0] {
    title,
    subtitle,
    address,
    description,
    price,
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
          <h1 className="text-secondary mb-1" style={{ fontSize: '2.5rem' }}>
            {property.title}
          </h1>

          <p className="text-primary mb-3" style={{ fontSize: '1.1rem' }}>
            {property.subtitle && <span>{property.subtitle}</span>}
            {property.subtitle && property.address && <span> · </span>}
            {property.address && <span>{property.address}</span>}
          </p>
          <hr className="border-primary mb-4" />

          <ImageCarousel images={property.images ?? []} title={property.title} />
          {property.description && (
            <div className="mb-5">
              <PortableText value={property.description} />
            </div>
          )}

          <hr className="border-secondary my-4" />
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-primary fw-bold" style={{ fontSize: '2.5rem' }}>
              {property.price != null ? `$${property.price.toLocaleString()}` : 'Consultar precio'}
            </span>
            <button className="btn btn-info text-white px-4 py-2 fw-bold">
              contactate con <span className="fw-bold">dzts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
