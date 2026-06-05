"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OperationSlug, ParsedFilters } from "@/types/filterRoutes";

interface LegacyFilterRedirectProps {
  /** Canonical filter combos that have a pre-rendered page (e.g. "venta/casa"). */
  existingCombos: Set<string>;
}

/**
 * Rewrites legacy query-param filter links (`/propiedades?operacion=venta&...`)
 * to the canonical route. Drops principal dimensions whose combo isn't
 * pre-rendered so we never redirect to a 404 — worst case lands on `/propiedades`.
 */
export default function LegacyFilterRedirect({
  existingCombos,
}: LegacyFilterRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const operacion = searchParams.get("operacion");
    const propiedad = searchParams.get("propiedad");
    const localidad = searchParams.get("localidad");
    if (!operacion && !propiedad && !localidad) return;

    const desired: ParsedFilters = {
      operation: (operacion as OperationSlug) || null,
      typeSlug: propiedad ? propiedad.split(",")[0] : null,
      citySlug: localidad ? localidad.split(",")[0] : null,
    };

    // Keep only the longest canonical prefix that has a real page.
    const segments = [desired.operation, desired.typeSlug, desired.citySlug];
    const kept: string[] = [];
    for (const seg of segments) {
      if (!seg) continue;
      const candidate = [...kept, seg];
      if (existingCombos.has(candidate.join("/"))) kept.push(seg);
    }
    const path = kept.length ? `/propiedades/${kept.join("/")}` : "/propiedades";

    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("operacion");
    rest.delete("propiedad");
    rest.delete("localidad");
    const qs = rest.toString();
    router.replace(qs ? `${path}?${qs}` : path);
  }, [router, searchParams, existingCombos]);

  return null;
}
