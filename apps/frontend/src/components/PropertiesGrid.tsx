import type { ComponentProps } from "react";
import PropertyCard from "./PropertyCard";

type PropertyCardData = Omit<ComponentProps<typeof PropertyCard>, "imageSizes"> & {
  _id: string;
};

const LISTING_IMAGE_SIZES =
  "(min-width: 1460px) 400px, (min-width: 1200px) calc(33.33vw - 86px), (min-width: 1036px) 400px, (min-width: 992px) calc(50vw - 118px), (min-width: 856px) 400px, (min-width: 576px) calc(50vw - 28px), (min-width: 432px) 400px, calc(100vw - 32px)";

interface PropertiesGridProps {
  properties: PropertyCardData[];
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
      {properties.map((property, index) => (
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
            status={property.status}
            image={property.image}
            lqip={property.lqip}
            rooms={property.rooms}
            city={property.city}
            reference={property.reference}
            priority={index === 0}
            headingLevel="h2"
            imageSizes={LISTING_IMAGE_SIZES}
          />
        </div>
      ))}
    </div>
  );
}
