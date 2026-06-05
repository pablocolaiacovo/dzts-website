import type { ParsedFilters, OperationSlug, FilterCombo } from "@/types/filterRoutes";

export const OPERATION_SLUGS: readonly OperationSlug[] = ["venta", "alquiler"];

export interface KnownSlugs {
  types: Set<string>;
  cities: Set<string>;
}

/** Orden canónico: operación → tipo → ciudad. Cada dimensión opcional, sin repetir. */
export function parseSegments(
  segments: string[],
  known: KnownSlugs,
): ParsedFilters | null {
  if (segments.length === 0 || segments.length > 3) return null;

  const result: ParsedFilters = {
    operation: null,
    typeSlug: null,
    citySlug: null,
  };
  // rank refleja el orden canónico; cada segmento debe avanzar el rank.
  let lastRank = -1;

  for (const seg of segments) {
    let rank: number;
    if ((OPERATION_SLUGS as readonly string[]).includes(seg)) {
      if (result.operation !== null) return null;
      result.operation = seg as OperationSlug;
      rank = 0;
    } else if (known.types.has(seg)) {
      if (result.typeSlug !== null) return null;
      result.typeSlug = seg;
      rank = 1;
    } else if (known.cities.has(seg)) {
      if (result.citySlug !== null) return null;
      result.citySlug = seg;
      rank = 2;
    } else {
      return null;
    }
    if (rank <= lastRank) return null; // fuera de orden canónico
    lastRank = rank;
  }

  return result;
}

export function buildFilterPath(filters: ParsedFilters): string {
  const parts = [filters.operation, filters.typeSlug, filters.citySlug].filter(
    (p): p is string => Boolean(p),
  );
  return parts.length === 0 ? "/propiedades" : `/propiedades/${parts.join("/")}`;
}

interface ComboSource {
  operationType?: string | null;
  typeSlug?: string | null;
  citySlug?: string | null;
}

export function buildFilterCombos(properties: ComboSource[]): FilterCombo[] {
  const seen = new Set<string>();
  const combos: FilterCombo[] = [];

  for (const p of properties) {
    const dims = [p.operationType, p.typeSlug, p.citySlug]; // orden canónico
    // recorrer los 2^3 subconjuntos preservando el orden de las dimensiones
    for (let mask = 1; mask < 8; mask++) {
      const combo: string[] = [];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        if (mask & (1 << i)) {
          const value = dims[i];
          if (!value) {
            ok = false;
            break;
          }
          combo.push(value);
        }
      }
      if (!ok) continue;
      const key = combo.join("/");
      if (!seen.has(key)) {
        seen.add(key);
        combos.push(combo);
      }
    }
  }

  return combos;
}
