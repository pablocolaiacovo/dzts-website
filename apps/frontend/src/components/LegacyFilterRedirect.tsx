"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildFilterPath } from "@/lib/filterRoutes";
import type { OperationSlug } from "@/types/filterRoutes";

export default function LegacyFilterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const operacion = searchParams.get("operacion");
    const propiedad = searchParams.get("propiedad");
    const localidad = searchParams.get("localidad");
    if (!operacion && !propiedad && !localidad) return;

    const path = buildFilterPath({
      operation: (operacion as OperationSlug) || null,
      typeSlug: propiedad ? propiedad.split(",")[0] : null,
      citySlug: localidad ? localidad.split(",")[0] : null,
    });

    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("operacion");
    rest.delete("propiedad");
    rest.delete("localidad");
    const qs = rest.toString();
    router.replace(qs ? `${path}?${qs}` : path);
  }, [router, searchParams]);

  return null;
}
