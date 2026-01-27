import type { Metadata } from "next";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import PropertiesLayout from "@/components/PropertiesLayout";
import PropertiesGrid from "@/components/PropertiesGrid";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Propiedades | DZTS Inmobiliaria",
  description: "Explora nuestras propiedades disponibles para venta y alquiler",
};

const PAGE_SIZE = 12;

const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property"
    && ($operationType == "" || operationType == $operationType)
    && (count($propertyTypeSlugs) == 0 || propertyType->slug.current in $propertyTypeSlugs)
    && (count($citySlugs) == 0 || city->slug.current in $citySlugs)
    && (count($roomsList) == 0 || rooms in $roomsList)
  ] | order(publishedAt desc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    price,
    currency,
    operationType,
    "propertyType": propertyType->name,
    "city": city->name,
    rooms,
    "image": images[0]
  }
`);

const COUNT_QUERY = defineQuery(`
  count(*[_type == "property"
    && ($operationType == "" || operationType == $operationType)
    && (count($propertyTypeSlugs) == 0 || propertyType->slug.current in $propertyTypeSlugs)
    && (count($citySlugs) == 0 || city->slug.current in $citySlugs)
    && (count($roomsList) == 0 || rooms in $roomsList)
  ])
`);

const CITIES_QUERY = defineQuery(`
  *[_type == "city"] | order(name asc) { name, "slug": slug.current }
`);

const PROPERTY_TYPES_QUERY = defineQuery(`
  *[_type == "propertyTypeCategory"] | order(name asc) { name, "slug": slug.current }
`);

const ROOM_COUNTS_QUERY = defineQuery(`
  array::unique(*[_type == "property" && defined(rooms)].rooms) | order(@ asc)
`);

interface PageProps {
  searchParams: Promise<{
    operacion?: string;
    propiedad?: string;
    localidad?: string;
    dormitorios?: string;
    pagina?: string;
  }>;
}

const parseMultiple = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split(",").filter(Boolean);
};

export default async function PropiedadesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const operationType = params.operacion || "";
  const propertyTypeSlugs = parseMultiple(params.propiedad);
  const citySlugs = parseMultiple(params.localidad);
  const roomsList = parseMultiple(params.dormitorios).map((r) => parseInt(r, 10));
  const parsedPage = params.pagina ? parseInt(params.pagina, 10) : 1;
  const currentPage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [
    { data: properties },
    { data: totalCount },
    { data: cities },
    { data: propertyTypes },
    { data: roomCounts },
  ] = await Promise.all([
    sanityFetch({
      query: PROPERTIES_QUERY,
      params: {
        operationType,
        propertyTypeSlugs,
        citySlugs,
        roomsList,
        start,
        end,
      },
    }),
    sanityFetch({
      query: COUNT_QUERY,
      params: {
        operationType,
        propertyTypeSlugs,
        citySlugs,
        roomsList,
      },
    }),
    sanityFetch({ query: CITIES_QUERY }),
    sanityFetch({ query: PROPERTY_TYPES_QUERY }),
    sanityFetch({ query: ROOM_COUNTS_QUERY }),
  ]);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  const filterOptions = {
    cities: (cities || []).filter(
      (c): c is { name: string; slug: string } => c.name !== null && c.slug !== null
    ),
    propertyTypes: (propertyTypes || []).filter(
      (t): t is { name: string; slug: string } => t.name !== null && t.slug !== null
    ),
    roomCounts: (roomCounts || []).filter(
      (r: number | null): r is number => r !== null && r !== undefined
    ),
  };

  const currentSearchParams = {
    operacion: operationType || undefined,
    propiedad: params.propiedad || undefined,
    localidad: params.localidad || undefined,
    dormitorios: params.dormitorios || undefined,
  };

  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <h1 className="text-center mb-4 fw-bold">Propiedades</h1>

      <PropertiesLayout filterOptions={filterOptions} totalCount={totalCount || 0}>
        <PropertiesGrid properties={properties || []} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={currentSearchParams}
        />
      </PropertiesLayout>
    </main>
  );
}
