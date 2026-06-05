import { describe, it, expect } from "vitest";
import { buildFilterSeoDefaults, findFilterSeoOverride } from "./filterSeo";

const labels = {
  typeNameBySlug: { casa: "Casas", departamento: "Departamentos" },
  cityNameBySlug: { rosario: "Rosario", funes: "Funes" },
};

describe("buildFilterSeoDefaults", () => {
  it("operación + tipo + ciudad", () => {
    const r = buildFilterSeoDefaults(
      { operation: "venta", typeSlug: "casa", citySlug: "rosario" },
      labels,
    );
    expect(r.h1).toBe("Casas en venta en Rosario");
    expect(r.title).toBe("Casas en venta en Rosario");
    expect(r.canonicalUrl).toBe("/propiedades/venta/casa/rosario");
    expect(r.description).toContain("Casas en venta en Rosario");
  });

  it("solo operación", () => {
    const r = buildFilterSeoDefaults(
      { operation: "alquiler", typeSlug: null, citySlug: null },
      labels,
    );
    expect(r.h1).toBe("Propiedades en alquiler");
  });

  it("solo ciudad", () => {
    const r = buildFilterSeoDefaults(
      { operation: null, typeSlug: null, citySlug: "funes" },
      labels,
    );
    expect(r.h1).toBe("Propiedades en Funes");
  });
});

describe("findFilterSeoOverride", () => {
  const entries = [
    { operation: "venta", typeSlug: null, citySlug: null, seo: { metaTitle: "V" }, intro: null },
    { operation: "alquiler", typeSlug: "departamento", citySlug: "funes", seo: { metaTitle: "AF" }, intro: null },
  ];

  it("encuentra match exacto", () => {
    expect(
      findFilterSeoOverride(entries, { operation: "venta", typeSlug: null, citySlug: null })?.seo
        .metaTitle,
    ).toBe("V");
  });

  it("devuelve null si no hay match exacto", () => {
    expect(
      findFilterSeoOverride(entries, { operation: "venta", typeSlug: "casa", citySlug: null }),
    ).toBeNull();
  });
});
