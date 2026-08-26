"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { TransitionStartFunction } from "react";
import type { FilterOption } from "@/types/filters";
import type { ParsedFilters } from "@/types/filterRoutes";
import { parseMultiple } from "@/lib/filters";
import { buildFilterPath } from "@/lib/filterRoutes";

interface ActiveFilterBadgesProps {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  startTransition: TransitionStartFunction;
  routeFilters: ParsedFilters;
}

export default function ActiveFilterBadges({
  cities,
  propertyTypes,
  startTransition,
  routeFilters,
}: ActiveFilterBadgesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const appliedDormitorios = parseMultiple(searchParams.get("dormitorios"));
  const appliedDisponibles = searchParams.get("disponibles") === "1";
  const appliedSupMin = searchParams.get("supmin") || "";
  const appliedSupMax = searchParams.get("supmax") || "";

  const getOperacionLabel = (value: string) => {
    if (value === "venta") return "Venta";
    if (value === "alquiler") return "Alquiler";
    return value;
  };

  const getPropiedadLabel = (slug: string) => {
    const found = propertyTypes.find((t) => t.slug === slug);
    return found?.name || slug;
  };

  const getLocalidadLabel = (slug: string) => {
    const found = cities.find((c) => c.slug === slug);
    return found?.name || slug;
  };

  const getDormitoriosLabel = (value: string) => {
    const count = parseInt(value, 10);
    return `${count} ${count === 1 ? "dorm." : "dorms."}`;
  };

  const getSuperficieLabel = (min: string, max: string) => {
    if (min && max) return `${min} - ${max} m²`;
    if (min) return `Desde ${min} m²`;
    return `Hasta ${max} m²`;
  };

  const removePrincipal = (dim: "operation" | "typeSlug" | "citySlug") => {
    const next: ParsedFilters = { ...routeFilters, [dim]: null };
    const qs = searchParams.toString();
    const path = buildFilterPath(next);
    startTransition(() => {
      router.push(qs ? `${path}?${qs}` : path);
    });
  };

  const removeSecondary = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "disponibles") {
      params.delete(key);
    } else if (key === "superficie") {
      params.delete("supmin");
      params.delete("supmax");
    } else {
      const current = parseMultiple(params.get(key));
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) params.set(key, updated.join(","));
      else params.delete(key);
    }
    params.delete("pagina");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/propiedades");
    });
  };

  const appliedFilters: { key: string; value: string; label: string; icon: string; onRemove: () => void }[] = [];

  if (routeFilters.operation) {
    appliedFilters.push({
      key: "operation",
      value: routeFilters.operation,
      label: getOperacionLabel(routeFilters.operation),
      icon: "bi-tag",
      onRemove: () => removePrincipal("operation"),
    });
  }
  if (routeFilters.typeSlug) {
    appliedFilters.push({
      key: "typeSlug",
      value: routeFilters.typeSlug,
      label: getPropiedadLabel(routeFilters.typeSlug),
      icon: "bi-house",
      onRemove: () => removePrincipal("typeSlug"),
    });
  }
  if (routeFilters.citySlug) {
    appliedFilters.push({
      key: "citySlug",
      value: routeFilters.citySlug,
      label: getLocalidadLabel(routeFilters.citySlug),
      icon: "bi-geo-alt",
      onRemove: () => removePrincipal("citySlug"),
    });
  }
  appliedDormitorios.forEach((value) => {
    appliedFilters.push({
      key: "dormitorios",
      value,
      label: getDormitoriosLabel(value),
      icon: "bi-door-open",
      onRemove: () => removeSecondary("dormitorios", value),
    });
  });
  if (appliedDisponibles) {
    appliedFilters.push({
      key: "disponibles",
      value: "1",
      label: "Solo disponibles",
      icon: "bi-check-circle",
      onRemove: () => removeSecondary("disponibles", "1"),
    });
  }
  if (appliedSupMin || appliedSupMax) {
    appliedFilters.push({
      key: "superficie",
      value: "",
      label: getSuperficieLabel(appliedSupMin, appliedSupMax),
      icon: "bi-rulers",
      onRemove: () => removeSecondary("superficie", ""),
    });
  }

  if (appliedFilters.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
      <span className="text-muted small me-1">Filtros activos:</span>
      {appliedFilters.map(({ key, value, label, icon, onRemove }) => (
        <span
          key={`${key}-${value}`}
          className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2"
        >
          <i className={`bi ${icon}`}></i>
          {label}
          <button
            type="button"
            className="btn-close btn-close-sm ms-1"
            style={{ fontSize: "0.6rem" }}
            aria-label={`Quitar filtro ${label}`}
            onClick={onRemove}
          />
        </span>
      ))}
      <button
        type="button"
        className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-2"
        onClick={clearAllFilters}
      >
        Limpiar todos
      </button>
    </div>
  );
}
