import type { PortableTextBlock } from "@portabletext/types";
import type { ParsedFilters } from "@/types/filterRoutes";
import { buildFilterPath } from "./filterRoutes";

interface Labels {
  typeNameBySlug: Record<string, string>;
  cityNameBySlug: Record<string, string>;
}

const OPERATION_LABEL: Record<string, string> = {
  venta: "venta",
  alquiler: "alquiler",
};

export interface FilterSeoDefaults {
  title: string;
  description: string;
  h1: string;
  canonicalUrl: string;
}

/** Construye el encabezado humano: "Casas en venta en Rosario", "Propiedades en alquiler", etc. */
export function buildFilterSeoDefaults(
  filters: ParsedFilters,
  labels: Labels,
): FilterSeoDefaults {
  const noun = filters.typeSlug
    ? labels.typeNameBySlug[filters.typeSlug] || "Propiedades"
    : "Propiedades";
  const op = filters.operation ? ` en ${OPERATION_LABEL[filters.operation]}` : "";
  const city = filters.citySlug
    ? ` en ${labels.cityNameBySlug[filters.citySlug] || ""}`.trimEnd()
    : "";

  const h1 = `${noun}${op}${city}`.replace(/\s+/g, " ").trim();
  const description = `${h1}. Mirá nuestro catálogo y consultá por la propiedad que buscás.`;

  return {
    title: h1,
    description,
    h1,
    canonicalUrl: buildFilterPath(filters),
  };
}

export interface FilterSeoEntry {
  operation: string | null;
  typeSlug: string | null;
  citySlug: string | null;
  seo: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: { asset?: { url?: string | null } | null } | null;
    noIndex?: boolean | null;
  };
  intro?: PortableTextBlock[] | null;
}

export function findFilterSeoOverride(
  entries: FilterSeoEntry[],
  filters: ParsedFilters,
): FilterSeoEntry | null {
  return (
    entries.find(
      (e) =>
        (e.operation ?? null) === filters.operation &&
        (e.typeSlug ?? null) === filters.typeSlug &&
        (e.citySlug ?? null) === filters.citySlug,
    ) ?? null
  );
}
