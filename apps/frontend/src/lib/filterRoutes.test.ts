import { describe, it, expect } from "vitest";
import { parseSegments, buildFilterPath, buildFilterCombos } from "./filterRoutes";

const KNOWN = {
  types: new Set(["casa", "departamento"]),
  cities: new Set(["rosario", "funes"]),
};

describe("parseSegments", () => {
  it("parsea operación sola", () => {
    expect(parseSegments(["venta"], KNOWN)).toEqual({
      operation: "venta",
      typeSlug: null,
      citySlug: null,
    });
  });

  it("parsea operación + tipo + ciudad en orden canónico", () => {
    expect(parseSegments(["venta", "casa", "rosario"], KNOWN)).toEqual({
      operation: "venta",
      typeSlug: "casa",
      citySlug: "rosario",
    });
  });

  it("parsea operación + ciudad (sin tipo)", () => {
    expect(parseSegments(["alquiler", "funes"], KNOWN)).toEqual({
      operation: "alquiler",
      typeSlug: null,
      citySlug: "funes",
    });
  });

  it("parsea tipo solo y ciudad sola", () => {
    expect(parseSegments(["casa"], KNOWN)).toEqual({
      operation: null,
      typeSlug: "casa",
      citySlug: null,
    });
    expect(parseSegments(["rosario"], KNOWN)).toEqual({
      operation: null,
      typeSlug: null,
      citySlug: "rosario",
    });
  });

  it("rechaza orden no canónico (ciudad antes que tipo)", () => {
    expect(parseSegments(["venta", "rosario", "casa"], KNOWN)).toBeNull();
  });

  it("rechaza segmento desconocido", () => {
    expect(parseSegments(["venta", "no-existe"], KNOWN)).toBeNull();
  });

  it("rechaza duplicados de la misma dimensión", () => {
    expect(parseSegments(["casa", "departamento"], KNOWN)).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(parseSegments([], KNOWN)).toBeNull();
  });
});

describe("buildFilterPath", () => {
  it("arma la URL canónica completa", () => {
    expect(
      buildFilterPath({
        operation: "venta",
        typeSlug: "casa",
        citySlug: "rosario",
      }),
    ).toBe("/propiedades/venta/casa/rosario");
  });

  it("omite dimensiones nulas manteniendo el orden", () => {
    expect(
      buildFilterPath({ operation: "alquiler", typeSlug: null, citySlug: "funes" }),
    ).toBe("/propiedades/alquiler/funes");
  });

  it("sin filtros principales devuelve la base", () => {
    expect(
      buildFilterPath({ operation: null, typeSlug: null, citySlug: null }),
    ).toBe("/propiedades");
  });
});

describe("buildFilterCombos", () => {
  const props = [
    { operationType: "venta", typeSlug: "casa", citySlug: "rosario" },
    { operationType: "venta", typeSlug: "casa", citySlug: "rosario" },
    { operationType: "alquiler", typeSlug: "departamento", citySlug: "funes" },
    { operationType: "venta", typeSlug: null, citySlug: null },
  ];

  it("emite todas las subcombinaciones canónicas presentes, sin duplicados", () => {
    const combos = buildFilterCombos(props).map((c) => c.join("/")).sort();
    expect(combos).toEqual(
      [
        "alquiler",
        "alquiler/departamento",
        "alquiler/departamento/funes",
        "alquiler/funes",
        "casa",
        "casa/rosario",
        "departamento",
        "departamento/funes",
        "funes",
        "rosario",
        "venta",
        "venta/casa",
        "venta/casa/rosario",
        "venta/rosario",
      ].sort(),
    );
  });

  it("ignora propiedades sin ninguna dimensión", () => {
    expect(buildFilterCombos([{ operationType: null, typeSlug: null, citySlug: null }])).toEqual(
      [],
    );
  });
});
