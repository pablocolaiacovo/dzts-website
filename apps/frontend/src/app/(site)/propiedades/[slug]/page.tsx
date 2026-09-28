import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import {
  getCachedOrganization,
  buildOrganizationJsonLd,
} from "@/sanity/queries/siteSettings";
import {
  getCachedProperty,
  getAllPropertySlugs,
} from "@/sanity/queries/propertyDetail";
import { resolveMetadata } from "@/lib/seo";

import Breadcrumb from "@/components/Breadcrumb";
import ShareButton from "@/components/ShareButton";
import TrackedLink from "@/components/TrackedLink";
import ImageCarousel from "@/components/ImageCarousel";
import MapSection from "@/components/MapSection";
import { ANALYTICS_EVENT } from "@/lib/analytics";
import "./property-detail.css";

type Property = NonNullable<Awaited<ReturnType<typeof getCachedProperty>>>;
type PropertyFeature = { icon: string; value: string | number; label: string };

const STATUS_LABELS: Record<string, string> = {
  reservado: "Reservado",
  vendido: "Vendido",
  alquilado: "Alquilado",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [property, siteSeo] = await Promise.all([
    getCachedProperty(slug),
    getCachedSiteSeo(),
  ]);

  if (!property) return {};

  const ogImageUrl = property.ogImage
    ? urlFor(property.ogImage).width(1200).height(630).url()
    : undefined;

  return resolveMetadata(property.seo, siteSeo, {
    title: property.title,
    description: property.subtitle,
    ogImageUrl,
    canonicalUrl: `/propiedades/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((entry) => ({ slug: entry.slug }));
}

function PropertyGallery({ property }: { property: Property }) {
  const statusLabel = property.status
    ? STATUS_LABELS[property.status]
    : undefined;
  const isReservado = property.status === "reservado";

  const carouselImages = (property.images ?? []).map((img) => {
    const asset = img?.asset?.url
      ? (img.asset as SanityImageSource)
      : null;
    return { asset, lqip: img?.asset?.metadata?.lqip ?? null };
  });

  return (
    <div className="position-relative">
      {statusLabel && (
        <div
          className={`status-banner${isReservado ? " status-banner--reservado" : ""}`}
          aria-label={`Propiedad ${statusLabel.toLowerCase()}`}
        >
          <span>{statusLabel}</span>
        </div>
      )}
      <div className="rounded-2 overflow-hidden">
        <ImageCarousel images={carouselImages} title={property.title ?? ""} />
      </div>
    </div>
  );
}

function PropertySummary({ property }: { property: Property }) {
  const location = [property.address, property.city].filter(Boolean).join(", ");

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        {property.operationType && (
          <span
            className={`badge rounded-pill ${property.operationType === "venta" ? "bg-success" : "bg-warning text-dark"}`}
          >
            {property.operationType === "venta" ? "Venta" : "Alquiler"}
          </span>
        )}
        {property.propertyType && (
          <span className="badge rounded-pill bg-primary">
            {property.propertyType}
          </span>
        )}
        {property.reference && (
          <span className="text-muted small ms-1">
            Ref. {property.reference}
          </span>
        )}
      </div>
      <h1 className="fs-4 text-dark mb-1">{property.title}</h1>
      {location && (
        <p className="text-secondary mb-1">
          <i className="bi bi-geo-alt-fill text-primary me-1" aria-hidden="true" />
          {location}
        </p>
      )}
      {property.subtitle && (
        <p className="text-muted small mb-3">{property.subtitle}</p>
      )}
    </>
  );
}

function PropertyFeatureList({ features }: { features: PropertyFeature[] }) {
  if (features.length === 0) return null;

  return (
    <ul className="property-features d-flex flex-wrap list-unstyled border-top border-bottom mb-3">
      {features.map((feature) => (
        <li key={feature.icon} className="d-flex align-items-center gap-2">
          <i className={`bi bi-${feature.icon}`} aria-hidden="true" />
          <span>
            <b>{feature.value}</b> {feature.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PropertyPriceBox({
  slug,
  title,
  price,
  whatsappShareUrl,
  whatsappConsultUrl,
}: {
  slug: string;
  title: string | null;
  price: string;
  whatsappShareUrl: string;
  whatsappConsultUrl: string | null;
}) {
  return (
    <div className="property-price-box bg-light border rounded">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <p className="fs-3 fw-bold text-primary lh-1 mb-0">{price}</p>
        {whatsappConsultUrl && (
          <TrackedLink
            href={whatsappConsultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success text-white fw-bold px-3 flex-grow-1 flex-sm-grow-0"
            eventName={ANALYTICS_EVENT.whatsappContact}
            eventParams={{
              location: "property_detail",
              property_slug: slug,
              property_title: title ?? undefined,
            }}
          >
            <i className="bi bi-whatsapp me-2" aria-hidden="true" />
            Consultar
          </TrackedLink>
        )}
      </div>
      <div className="property-price-box__actions d-flex flex-wrap align-items-center gap-3 border-top">
        <TrackedLink
          href={`/propiedades/${slug}/ficha`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-link btn-sm d-inline-flex align-items-center"
          eventName={ANALYTICS_EVENT.fichaOpen}
          eventParams={{ property_slug: slug }}
        >
          <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />
          Ficha
        </TrackedLink>
        <ShareButton propertySlug={slug} />
        <TrackedLink
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-link btn-sm d-inline-flex align-items-center"
          aria-label="Compartir por WhatsApp"
          eventName={ANALYTICS_EVENT.share}
          eventParams={{ method: "whatsapp", location: "property_detail", property_slug: slug }}
        >
          <i className="bi bi-whatsapp me-1" aria-hidden="true" />
          Enviar
        </TrackedLink>
      </div>
    </div>
  );
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [property, organization] = await Promise.all([
    getCachedProperty(slug),
    getCachedOrganization(),
  ]);

  if (!property) {
    notFound();
  }

  const imageUrls = (property.images ?? [])
    .filter((img) => img?.asset?.url)
    .map((img) => img!.asset!.url!);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.subtitle,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/propiedades/${slug}`,
    ...(property.price != null && {
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: property.currency === "ARS" ? "ARS" : "USD",
      },
    }),
    ...(property.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        ...(property.city && { addressLocality: property.city }),
        addressCountry: "AR",
      },
    }),
    ...(imageUrls.length > 0 && { image: imageUrls }),
    ...(organization && {
      offeredBy: buildOrganizationJsonLd(organization),
    }),
  };

  const features: PropertyFeature[] = [
    property.rooms != null && {
      icon: "door-open",
      value: property.rooms,
      label: "dorm.",
    },
    property.bathrooms != null && {
      icon: "droplet",
      value: property.bathrooms,
      label: property.bathrooms === 1 ? "baño" : "baños",
    },
    property.garages != null && {
      icon: "car-front",
      value: property.garages,
      label: property.garages === 1 ? "cochera" : "cocheras",
    },
    property.sizeCovered != null && {
      icon: "house-door",
      value: `${property.sizeCovered} m²`,
      label: "cub.",
    },
    property.sizeTotal != null && {
      icon: "rulers",
      value: `${property.sizeTotal} m²`,
      label: "tot.",
    },
    property.sizeLand != null && {
      icon: "bounding-box",
      value: `${property.sizeLand} m²`,
      label: "lote",
    },
  ].filter(Boolean) as PropertyFeature[];

  const price =
    property.price != null
      ? `${property.currency === "ARS" ? "AR$" : "US$"}${property.price.toLocaleString("es-AR")}`
      : "Consultar precio";

  const whatsappNumber = organization?.whatsappNumber;
  const whatsappConsultUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, me interesa la propiedad "${property.title}". ¿Podrían darme más información?`)}`
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const propertyUrl = `${siteUrl}/propiedades/${slug}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${property.title} - ${propertyUrl}`)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="property-detail container pt-3 pb-5">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/", isHome: true },
            { label: "Propiedades", href: "/propiedades" },
            {
              label: property.title || "Propiedad",
              href: `/propiedades/${slug}`,
            },
          ]}
        />
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-7">
            <PropertyGallery property={property} />
          </div>
          <div className="col-12 col-lg-5">
            <PropertySummary property={property} />
            <PropertyFeatureList features={features} />
            <PropertyPriceBox
              slug={slug}
              title={property.title}
              price={price}
              whatsappShareUrl={whatsappShareUrl}
              whatsappConsultUrl={whatsappConsultUrl}
            />
          </div>
        </div>
        {property.description ? (
          <div className="row mt-4">
            <div className="col-12 col-lg-8">
              <h2 className="fs-5 fw-semibold mb-2">Descripción</h2>
              <PortableText value={property.description} />
            </div>
          </div>
        ) : null}
      </div>
      <MapSection
        address={[property.address, property.city, "Argentina"]
          .filter(Boolean)
          .join(", ")}
        title={`Ubicación de ${property.title || "la propiedad"}`}
      />
    </>
  );
}
