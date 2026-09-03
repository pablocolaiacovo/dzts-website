import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  buildPropertyTitle,
  buildPropertyDescription,
} from "./propertySeo";

describe("normalizeTitle", () => {
  it("converts an all-caps string to sentence case", () => {
    expect(normalizeTitle("DEPARTAMENTO 1 DORMITORIO")).toBe(
      "Departamento 1 dormitorio",
    );
  });

  it("leaves mixed-case strings untouched", () => {
    expect(normalizeTitle("Casa en Granadero Baigorria")).toBe(
      "Casa en Granadero Baigorria",
    );
  });

  it("treats digits and punctuation as case-neutral", () => {
    expect(normalizeTitle("PH 3 AMBIENTES - APTO CRÉDITO")).toBe(
      "Ph 3 ambientes - apto crédito",
    );
  });

  it("returns numeric-only strings unchanged", () => {
    expect(normalizeTitle("12345")).toBe("12345");
  });
});

describe("buildPropertyTitle", () => {
  it("appends operation and city when absent from the title", () => {
    expect(
      buildPropertyTitle({
        title: "DEPARTAMENTO 1 DORMITORIO",
        operationType: "venta",
        city: "Rosario",
      }),
    ).toBe("Departamento 1 dormitorio en venta en Rosario");
  });

  it("includes the neighborhood before the city", () => {
    expect(
      buildPropertyTitle({
        title: "Casa",
        operationType: "alquiler",
        city: "Rosario",
        neighborhood: "Fisherton",
      }),
    ).toBe("Casa en alquiler en Fisherton, Rosario");
  });

  it("does not duplicate a city already present in the title", () => {
    expect(
      buildPropertyTitle({
        title: "CASA EN GRANADERO BAIGORRIA",
        operationType: "venta",
        city: "Granadero Baigorria",
      }),
    ).toBe("Casa en granadero baigorria en venta");
  });

  it("omits parts that are missing", () => {
    expect(buildPropertyTitle({ title: "Terreno en esquina" })).toBe(
      "Terreno en esquina",
    );
  });

  it("falls back to a generic label when the title is missing", () => {
    expect(
      buildPropertyTitle({ operationType: "venta", city: "Rosario" }),
    ).toBe("Propiedad en venta en Rosario");
  });
});

describe("buildPropertyDescription", () => {
  it("composes title, subtitle, price and CTA sentences", () => {
    const description = buildPropertyDescription({
      title: "DEPARTAMENTO 1 DORMITORIO",
      subtitle: "APTO CREDITO",
      operationType: "venta",
      city: "Rosario",
      rooms: 1,
      price: 85000,
      currency: "USD",
    });

    expect(description).toBe(
      "Departamento 1 dormitorio en venta en Rosario. Apto credito. US$85.000. Consultá por WhatsApp con DZTS Inmobiliaria.",
    );
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it("formats ARS prices with the AR$ prefix", () => {
    const description = buildPropertyDescription({
      title: "Casa",
      price: 120000000,
      currency: "ARS",
    });

    expect(description).toContain("AR$120.000.000.");
  });

  it("adds a bedrooms sentence when the title does not already mention rooms", () => {
    const description = buildPropertyDescription({
      title: "Casa en Fisherton",
      rooms: 3,
    });

    expect(description).toContain("3 dormitorios.");
  });

  it("skips the bedrooms sentence when the title already mentions rooms", () => {
    const description = buildPropertyDescription({
      title: "Departamento 1 dormitorio",
      rooms: 1,
    });

    expect(description).not.toMatch(/\d+ dormitorios?\.\s.*\d+ dormitorios?\./);
    expect(description.match(/dormitorio/gi)?.length).toBe(1);
  });

  it("never produces an empty string when the title exists", () => {
    const description = buildPropertyDescription({ title: "Lote" });
    expect(description.length).toBeGreaterThan(0);
  });

  it("falls back gracefully with a generic label and CTA with no data at all", () => {
    const description = buildPropertyDescription({});
    expect(description.length).toBeGreaterThan(0);
    expect(description).toContain("DZTS Inmobiliaria");
  });

  it("drops trailing sentences rather than cutting mid-word when they don't fit", () => {
    const description = buildPropertyDescription({
      title: "Casa con pileta climatizada y parque arbolado en country privado",
      subtitle:
        "Una propiedad excepcional con terminaciones de primera calidad, quincho y garage para tres autos",
      operationType: "venta",
      city: "Rosario",
      neighborhood: "Fisherton",
      rooms: 5,
      price: 950000,
      currency: "USD",
    });

    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.endsWith(".")).toBe(true);
    expect(description).not.toContain("Consultá por WhatsApp");
  });

  it("trims an over-long single sentence at a word boundary, not mid-word", () => {
    const longTitle = "Propiedad ".repeat(20).trim();
    const fullTitleSentence = `${buildPropertyTitle({
      title: longTitle,
      operationType: "venta",
      city: "Rosario",
    })}.`;

    const description = buildPropertyDescription({
      title: longTitle,
      operationType: "venta",
      city: "Rosario",
    });

    expect(description.length).toBeLessThanOrEqual(155);
    expect(fullTitleSentence.startsWith(description)).toBe(true);
    const nextChar = fullTitleSentence[description.length];
    expect(nextChar === undefined || nextChar === " ").toBe(true);
  });
});
