export type OperationSlug = "venta" | "alquiler";

/** Filtros principales que vienen de la ruta (no de query params). */
export interface ParsedFilters {
  operation: OperationSlug | null;
  typeSlug: string | null;
  citySlug: string | null;
}

/** Una combinación canónica de segmentos con ≥1 propiedad. */
export type FilterCombo = string[]; // p. ej. ["venta", "casa", "rosario"]
