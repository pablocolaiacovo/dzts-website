import PropertyCard from "./PropertyCard";
import type { SanityImageSource } from "@sanity/image-url";

interface Property {
  _id: string;
  title: string | null;
  slug: string | null;
  subtitle?: string | null;
  price?: number | null;
  currency?: string | null;
  operationType?: string | null;
  image?: SanityImageSource | null;
  rooms?: number | null;
  city?: string | null;
}

interface PropertiesGridProps {
  properties: Property[];
}

export default function PropertiesGrid({ properties }: PropertiesGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">
          No se encontraron propiedades con los filtros seleccionados.
        </p>
        <p className="text-muted">
          Intenta ajustar los filtros para ver más resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {properties.map((property) => (
        <div
          key={property._id}
          className="col-12 col-sm-6 col-xl-4 d-flex justify-content-center"
        >
          <PropertyCard
            title={property.title}
            slug={property.slug}
            subtitle={property.subtitle}
            price={property.price}
            currency={property.currency}
            operationType={property.operationType}
            image={property.image}
            rooms={property.rooms}
            city={property.city}
          />
        </div>
      ))}
    </div>
  );
}
