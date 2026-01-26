import { defineQuery } from 'next-sanity';
import Link from 'next/link';
import Image from 'next/image';

import { urlFor } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';

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
          properties.map((property) => {
            const { title, slug, subtitle, price, image, operationType } = property;
            const imageUrl = image
              ? urlFor(image)
                .height(220)
                .width(400)
                .quality(80)
                .auto("format")
                .url()
              : "https://placehold.co/400x220/png";
            return (
              <div key={property.slug} className="col-12 col-md-4 d-flex justify-content-center mb-4">
                <Link href={`/propiedades/${slug}`} className="text-decoration-none">
                  <div className="card shadow-sm rounded-4 border-0" style={{ maxWidth: 400 }}>
                    <div className="position-relative">
                      <Image
                        src={imageUrl || 'https://placehold.co/400x220/png'}
                        alt={title || 'Property Image'}
                        width={400}
                        height={220}
                        className="card-img-top rounded-top-4"
                        style={{ objectFit: 'cover', height: 220 }}
                      />
                      {operationType && (
                        <span
                          className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${operationType === 'venta' ? 'bg-success' : 'bg-warning text-dark'}`}
                        >
                          {operationType === 'venta' ? 'Venta' : 'Alquiler'}
                        </span>
                      )}
                    </div>
                    <div className="w-100 bg-primary" style={{ height: 4 }}></div>
                    <div className="card-body text-center pb-2">
                      <h5 className="fw-bold text-primary mb-3 fs-4">
                        {title}
                      </h5>
                      {subtitle && (
                        <p className="mb-3 text-body">{subtitle}</p>
                      )}
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <span className="text-primary fs-4">
                          <i className="bi bi-share"></i>
                        </span>
                        <span className="fw-bold text-primary fs-4">
                          {price != null ? `$${price.toLocaleString()}` : 'Consultar precio'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })
        ) : (
          <p className="text-center text-muted">No hay propiedades disponibles</p>
        )}
      </div>
    </div>
  );
}