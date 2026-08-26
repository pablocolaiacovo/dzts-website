import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { ParsedFilters } from "@/types/filterRoutes";
import { buildFilterPath } from "@/lib/filterRoutes";
import Breadcrumb from "@/components/Breadcrumb";

interface FilteredListingIntroProps {
  filters: ParsedFilters;
  h1: string;
  typeName: string | null;
  cityName: string | null;
  intro?: PortableTextBlock[] | null;
}

const OPERATION_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

export default function FilteredListingIntro({
  filters,
  h1,
  typeName,
  cityName,
  intro,
}: FilteredListingIntroProps) {
  const crumbs: { label: string; href: string; isHome?: boolean }[] = [
    { label: "Inicio", href: "/", isHome: true },
    { label: "Propiedades", href: "/propiedades" },
  ];

  let acc: ParsedFilters = { operation: null, typeSlug: null, citySlug: null };
  if (filters.operation) {
    acc = { ...acc, operation: filters.operation };
    crumbs.push({ label: OPERATION_LABEL[filters.operation], href: buildFilterPath(acc) });
  }
  if (filters.typeSlug) {
    acc = { ...acc, typeSlug: filters.typeSlug };
    crumbs.push({ label: typeName || filters.typeSlug, href: buildFilterPath(acc) });
  }
  if (filters.citySlug) {
    acc = { ...acc, citySlug: filters.citySlug };
    crumbs.push({ label: cityName || filters.citySlug, href: buildFilterPath(acc) });
  }

  return (
    <>
      <Breadcrumb items={crumbs} />
      <h1 className="text-center mb-4 fw-bold">{h1}</h1>
      {intro && intro.length > 0 && (
        <div className="mb-4 text-muted">
          <PortableText value={intro} />
        </div>
      )}
    </>
  );
}
