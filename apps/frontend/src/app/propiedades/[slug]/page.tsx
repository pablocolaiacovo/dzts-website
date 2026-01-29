import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";

import Breadcrumb from "@/components/Breadcrumb";
import ImageCarousel from "@/components/ImageCarousel";
import MapSection from "@/components/MapSection";

const PROPERTY_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug][0]
  {
    title,
    subtitle,
    address,
    description,
    price,
    "propertyType": propertyType->name,
    operationType,
    currency,
    "city": city->name,
    "images": images[] { asset->{ _id, url, metadata { lqip } } }
  }
`);

const METADATA_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug][0]
  { title, subtitle, "image": images[0] }
`);

interface PropertyImageAsset {
  _id: string;
  url?: string | null;
  metadata?: { lqip?: string | null } | null;
}

interface PropertyImage {
  asset: PropertyImageAsset | null;
}

interface PropertyDetail {
  title: string | null;
  subtitle?: string | null;
  address?: string | null;
  description?: PortableTextBlock[] | null;
  price?: number | null;
  propertyType?: string | null;
  operationType?: string | null;
  currency?: string | null;
  city?: string | null;
  images?: Array<PropertyImage | null> | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: METADATA_QUERY, params: { slug } });

  if (!data) return {};

  const title = `${data.title || "Propiedad"} | DZTS Inmobiliaria`;
  const description = data.subtitle || "Propiedad en DZTS Inmobiliaria";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(data.image
        ? { images: [{ url: urlFor(data.image).width(1200).height(630).url() }] }
        : {}),
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: PROPERTY_QUERY,
    params: { slug },
  });
  const property = data as PropertyDetail | null;

  if (!property) {
    notFound();
  }

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <Breadcrumb
              items={[
                { label: "Inicio", href: "/", isHome: true },
                { label: "Propiedades", href: "/propiedades" },
                { label: property.title || "Propiedad" },
              ]}
            />
            <h1 className="text-secondary mb-2" style={{ fontSize: "2.5rem" }}>
              {property.title}
            </h1>
            <div className="d-flex gap-2 mb-2">
              {property.operationType && (
                <span
                  className={`badge rounded-pill fs-6 ${property.operationType === "venta" ? "bg-success" : "bg-warning text-dark"}`}
                >
                  {property.operationType === "venta" ? "Venta" : "Alquiler"}
                </span>
              )}
              {property.propertyType && (
                <span className="badge rounded-pill bg-info text-white fs-6">
                  {property.propertyType}
                </span>
              )}
            </div>

            <div className="text-primary mb-3" style={{ fontSize: "1.1rem" }}>
              {property.subtitle && <div>{property.subtitle}</div>}
              <div>
                {property.address}
                {property.address && property.city && ", "}
                {property.city && <span>{property.city}</span>}
              </div>
            </div>
            <hr className="border-primary mb-4" />

            <ImageCarousel
              images={(property.images ?? []).map((img) => {
                const asset = img?.asset?.url
                  ? (img.asset as SanityImageSource)
                  : null;

                return {
                  asset,
                  lqip: img?.asset?.metadata?.lqip ?? null,
                };
              })}
              title={property.title ?? ""}
            />
            {property.description ? (
              <div className="mb-5">
                <PortableText value={property.description} />
              </div>
            ) : null}

            <hr className="border-secondary my-4" />
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <span
                className="text-primary fw-bold fs-3 fs-md-1"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
              >
                {property.price != null
                  ? `${property.currency === "ARS" ? "ARS" : "USD"} $${property.price.toLocaleString()}`
                  : "Consultar precio"}
              </span>
              <button
                className="btn btn-info text-white px-4 py-2 fw-bold w-100 w-md-auto"
                style={{ maxWidth: "300px" }}
              >
                contactate con <span className="fw-bold">dzts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <MapSection address={property.address} />
    </>
  );
}
