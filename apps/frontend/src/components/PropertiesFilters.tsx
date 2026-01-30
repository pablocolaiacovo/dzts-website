"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FilterOption } from "@/types/filters";
import { parseMultiple } from "@/lib/filters";

interface PropertiesFiltersProps {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  roomCounts: number[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type SearchParams = ReturnType<typeof useSearchParams>;

interface PropertiesFiltersInnerProps extends PropertiesFiltersProps {
  searchParams: SearchParams;
}

function PropertiesFiltersInner({
  cities,
  propertyTypes,
  roomCounts,
  isCollapsed,
  onToggleCollapse,
  searchParams,
}: PropertiesFiltersInnerProps) {
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const [operacion, setOperacion] = useState(() => searchParams.get("operacion") || "");
  const [propiedad, setPropiedad] = useState<string[]>(() => parseMultiple(searchParams.get("propiedad")));
  const [localidad, setLocalidad] = useState<string[]>(() => parseMultiple(searchParams.get("localidad")));
  const [dormitorios, setDormitorios] = useState<string[]>(() => parseMultiple(searchParams.get("dormitorios")));

  const activeFilterCount =
    (operacion ? 1 : 0) + propiedad.length + localidad.length + dormitorios.length;

  const toggleArrayValue = (
    arr: string[],
    value: string,
    setter: (val: string[]) => void
  ) => {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (operacion) params.set("operacion", operacion);
    if (propiedad.length > 0) params.set("propiedad", propiedad.join(","));
    if (localidad.length > 0) params.set("localidad", localidad.join(","));
    if (dormitorios.length > 0) params.set("dormitorios", dormitorios.join(","));

    const queryString = params.toString();
    router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
    setIsOpenMobile(false);
  };

  const clearFilters = () => {
    setOperacion("");
    setPropiedad([]);
    setLocalidad([]);
    setDormitorios([]);
    router.push("/propiedades");
    setIsOpenMobile(false);
  };

  const filterForm = (
    <>
      {/* Operación - Radio buttons */}
      <div className="mb-4">
        <div className="fw-semibold mb-2 small text-uppercase text-muted">Operación</div>
        <div className="d-flex flex-column gap-2">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="operacion"
              id="operacion-todos"
              checked={operacion === ""}
              onChange={() => setOperacion("")}
            />
            <label className="form-check-label" htmlFor="operacion-todos">
              Todas
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="operacion"
              id="operacion-venta"
              checked={operacion === "venta"}
              onChange={() => setOperacion("venta")}
            />
            <label className="form-check-label" htmlFor="operacion-venta">
              Venta
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="operacion"
              id="operacion-alquiler"
              checked={operacion === "alquiler"}
              onChange={() => setOperacion("alquiler")}
            />
            <label className="form-check-label" htmlFor="operacion-alquiler">
              Alquiler
            </label>
          </div>
        </div>
      </div>

      {/* Tipo de propiedad - Checkboxes */}
      <div className="mb-4">
        <div className="fw-semibold mb-2 small text-uppercase text-muted">Tipo de propiedad</div>
        <div className="d-flex flex-column gap-2">
          {propertyTypes.map((type) => (
            <div key={type.slug} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`propiedad-${type.slug}`}
                checked={propiedad.includes(type.slug)}
                onChange={() => toggleArrayValue(propiedad, type.slug, setPropiedad)}
              />
              <label className="form-check-label" htmlFor={`propiedad-${type.slug}`}>
                {type.name}
              </label>
            </div>
          ))}
          {propertyTypes.length === 0 && (
            <span className="text-muted small">Sin opciones</span>
          )}
        </div>
      </div>

      {/* Localidad - Checkboxes */}
      <div className="mb-4">
        <div className="fw-semibold mb-2 small text-uppercase text-muted">Localidad</div>
        <div className="d-flex flex-column gap-2" style={{ maxHeight: 200, overflowY: "auto" }}>
          {cities.map((city) => (
            <div key={city.slug} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`localidad-${city.slug}`}
                checked={localidad.includes(city.slug)}
                onChange={() => toggleArrayValue(localidad, city.slug, setLocalidad)}
              />
              <label className="form-check-label" htmlFor={`localidad-${city.slug}`}>
                {city.name}
              </label>
            </div>
          ))}
          {cities.length === 0 && (
            <span className="text-muted small">Sin opciones</span>
          )}
        </div>
      </div>

      {/* Dormitorios - Checkboxes */}
      <div className="mb-4">
        <div className="fw-semibold mb-2 small text-uppercase text-muted">Dormitorios</div>
        <div className="d-flex flex-column gap-2">
          {roomCounts.map((count) => (
            <div key={count} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`dormitorios-${count}`}
                checked={dormitorios.includes(count.toString())}
                onChange={() =>
                  toggleArrayValue(dormitorios, count.toString(), setDormitorios)
                }
              />
              <label className="form-check-label" htmlFor={`dormitorios-${count}`}>
                {count} {count === 1 ? "dormitorio" : "dormitorios"}
              </label>
            </div>
          ))}
          {roomCounts.length === 0 && (
            <span className="text-muted small">Sin opciones</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="d-flex flex-column gap-2 pt-2 border-top">
        <button type="button" className="btn btn-primary" onClick={applyFilters}>
          Aplicar filtros
        </button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: Toggle button */}
      <button
        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between d-lg-none mb-4"
        type="button"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        aria-expanded={isOpenMobile}
        aria-controls="filters-form"
      >
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-funnel"></i>
          Filtros
          {activeFilterCount > 0 && (
            <span className="badge bg-primary rounded-pill">
              {activeFilterCount}
            </span>
          )}
        </span>
        <i className={`bi bi-chevron-${isOpenMobile ? "up" : "down"}`}></i>
      </button>

      {/* Desktop: Collapse/Expand button in sidebar */}
      {isCollapsed && (
        <div className="bg-light rounded-3 p-3 d-none d-lg-block">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 w-100"
            onClick={onToggleCollapse}
            title="Expandir filtros"
          >
            <i className="bi bi-funnel"></i>
            <span className="fw-semibold">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="badge bg-primary rounded-pill">
                {activeFilterCount}
              </span>
            )}
            <i className="bi bi-chevron-right ms-auto"></i>
          </button>
        </div>
      )}

      {/* Single filter form - shown/hidden based on viewport and state */}
      {(!isCollapsed || isOpenMobile) && (
        <div
          id="filters-form"
          className={`
            ${isOpenMobile ? "d-block" : "d-none"}
            d-lg-block
            ${isCollapsed ? "d-lg-none" : ""}
          `}
        >
          {/* Desktop: Header with collapse button */}
          <div className="d-none d-lg-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold">Filtros</h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onToggleCollapse}
              aria-label="Colapsar filtros"
              title="Colapsar filtros"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </div>

          {/* Actual filter form */}
          <div className="bg-light rounded-3 p-3">
            {filterForm}
          </div>
        </div>
      )}
    </>
  );
}

export default function PropertiesFilters(props: PropertiesFiltersProps) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  return (
    <PropertiesFiltersInner key={searchKey} searchParams={searchParams} {...props} />
  );
}
