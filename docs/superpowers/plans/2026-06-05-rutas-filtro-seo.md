# Rutas de filtro indexables para SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir los filtros principales (operación/tipo/ciudad) en rutas reales indexables bajo `/propiedades`, cada una con SEO propio, para habilitar sitelinks en Google.

**Architecture:** Una ruta catch-all `(site)/propiedades/[...segmentos]/page.tsx` unifica el detalle de propiedad y los listados filtrados, decidiendo por contenido. Los segmentos se parsean por valor (slugs disjuntos), en orden canónico operación/tipo/ciudad. `generateStaticParams` emite solo combinaciones con ≥1 propiedad. El SEO se resuelve con plantilla automática + override editable en un nuevo doc de Sanity `filterPageSeo`. Filtros secundarios siguen como query params.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), React 19 RSC, next-sanity, Sanity Studio v5, Vitest (unit), Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-06-05-rutas-filtro-seo-design.md`

---

## Convenciones del plan

- Comandos de frontend se corren desde `apps/frontend/` salvo aclaración.
- Unit tests con Vitest: `pnpm test` (o `pnpm exec vitest run <ruta>` para uno).
- Doble comilla en strings (Prettier). Mobile-first, clases Bootstrap.
- Commits frecuentes, en castellano, con el trailer `Co-Authored-By` del repo.
- Rama de trabajo: `feat/rutas-filtro-seo` (ya creada).

## Archivos: mapa de responsabilidades

**Nuevos (frontend):**
- `src/lib/filterRoutes.ts` — tipos + parser de segmentos + builder de URL canónica + generador de combos. Lógica pura, testeable.
- `src/lib/filterRoutes.test.ts` — unit tests de lo anterior.
- `src/lib/filterSeo.ts` — plantilla de title/description/h1 + matcher de override. Lógica pura.
- `src/lib/filterSeo.test.ts` — unit tests.
- `src/sanity/queries/filterPageSeo.ts` — fetch de overrides `filterPageSeo`.
- `src/types/filterRoutes.ts` — tipos compartidos (`ParsedFilters`, `FilterCombo`).
- `src/components/PropertyDetail.tsx` — detalle extraído del actual `[slug]/page.tsx` (RSC).
- `src/components/FilteredListingIntro.tsx` — h1 + breadcrumb + intro Portable Text para listados filtrados.
- `src/app/(site)/propiedades/[...segmentos]/page.tsx` — ruta unificada (detalle | listado filtrado).
- `src/app/(site)/propiedades/[...segmentos]/loading.tsx` — skeleton.

**Modificados (frontend):**
- `src/app/(site)/propiedades/page.tsx` — base, pasa filtros principales vacíos al listado.
- `src/components/PropertiesListing.tsx` — recibe filtros principales por props (ruta), secundarios por query params.
- `src/components/PropertiesFilters.tsx` — operación/tipo/ciudad navegan a la URL canónica.
- `src/components/ActiveFilterBadges.tsx` — quitar filtro principal = navegar a la URL sin ese segmento.
- `src/app/sitemap.ts` — agrega combos.
- `src/lib/seo.ts` / `src/types/seo.ts` — sin cambios de firma (se reutiliza `resolveMetadata`).

**Eliminados (frontend):**
- `src/app/(site)/propiedades/[slug]/page.tsx` y `.../[slug]/loading.tsx` — la lógica se mueve a `[...segmentos]`.

**Nuevos/modificados (studio):**
- `apps/studio/schemaTypes/filterPageSeoType.ts` — nuevo doc.
- `apps/studio/schemaTypes/index.ts` — registrar el doc.

**Docs:**
- `CLAUDE.md` — rutas + tabla de selectores e2e.

---

## Task 1: Spike de routing (de-risk del catch-all)

Antes de refactorizar, confirmar que un catch-all `[...segmentos]` convive con `propiedades/page.tsx` y con la ficha `(print)/propiedades/[slug]/ficha` sin error de "parallel routes", y que `next build` (export) resuelve bien.

**Files:**
- Create (temporal): `src/app/(site)/propiedades/[...segmentos]/page.tsx`

- [ ] **Step 1: Crear un catch-all mínimo**

```tsx
// src/app/(site)/propiedades/[...segmentos]/page.tsx
export function generateStaticParams() {
  return [{ segmentos: ["spike-test"] }];
}

export default async function Spike({
  params,
}: {
  params: Promise<{ segmentos: string[] }>;
}) {
  const { segmentos } = await params;
  return <main className="container py-5">spike: {segmentos.join("/")}</main>;
}
```

- [ ] **Step 2: Build de export y verificar coexistencia**

Run: `pnpm build`
Expected: build OK; en `out/` existen `propiedades/index.html` (base), `propiedades/spike-test/index.html` (catch-all) y `propiedades/<algún-slug>/ficha/index.html` (ficha). Sin error "two parallel pages resolve to the same path".

- [ ] **Step 3: Confirmar precedencia de la ficha**

Run: `ls out/propiedades/*/ficha/index.html | head`
Expected: al menos un `ficha/index.html` presente (la ruta literal `ficha` no fue absorbida por el catch-all).

- [ ] **Step 4: Borrar el spike**

```bash
rm -r "src/app/(site)/propiedades/[...segmentos]"
```

- [ ] **Step 5: Commit (registro del spike resuelto)**

```bash
git commit --allow-empty -m "chore: verificado que el catch-all convive con base y ficha (spike)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> Si el build fallara por rutas paralelas, detener y reevaluar: alternativa es mover la ficha a `(print)/propiedades/[...ficha]` o un sufijo no colisionante. No continuar con el resto del plan hasta resolverlo.

---

## Task 2: Tipos compartidos de filtros de ruta

**Files:**
- Create: `src/types/filterRoutes.ts`

- [ ] **Step 1: Definir los tipos**

```ts
// src/types/filterRoutes.ts
export type OperationSlug = "venta" | "alquiler";

/** Filtros principales que vienen de la ruta (no de query params). */
export interface ParsedFilters {
  operation: OperationSlug | null;
  typeSlug: string | null;
  citySlug: string | null;
}

/** Una combinación canónica de segmentos con ≥1 propiedad. */
export type FilterCombo = string[]; // p. ej. ["venta", "casa", "rosario"]
```

- [ ] **Step 2: Commit**

```bash
git add src/types/filterRoutes.ts
git commit -m "feat: tipos compartidos para filtros de ruta

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Parser de segmentos + builder de URL canónica (TDD)

`filterRoutes.ts` expone funciones puras: `parseSegments` (segmentos → `ParsedFilters` o `null` si inválido/no-canónico) y `buildFilterPath` (`ParsedFilters` → URL canónica).

**Files:**
- Create: `src/lib/filterRoutes.ts`
- Test: `src/lib/filterRoutes.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

```ts
// src/lib/filterRoutes.test.ts
import { describe, it, expect } from "vitest";
import { parseSegments, buildFilterPath } from "./filterRoutes";

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
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `pnpm exec vitest run src/lib/filterRoutes.test.ts`
Expected: FAIL (módulo / exports inexistentes).

- [ ] **Step 3: Implementar `filterRoutes.ts`**

```ts
// src/lib/filterRoutes.ts
import type { ParsedFilters, OperationSlug } from "@/types/filterRoutes";

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
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `pnpm exec vitest run src/lib/filterRoutes.test.ts`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterRoutes.ts src/lib/filterRoutes.test.ts
git commit -m "feat: parser de segmentos y builder de URL canónica de filtros

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Generador de combos estáticos (TDD)

`buildFilterCombos` recibe las propiedades publicadas y devuelve todas las combinaciones canónicas con ≥1 propiedad, como arrays de segmentos. Se usa en `generateStaticParams` y en `sitemap.ts`.

**Files:**
- Modify: `src/lib/filterRoutes.ts`
- Modify: `src/lib/filterRoutes.test.ts`

- [ ] **Step 1: Agregar tests que fallan**

```ts
// añadir a src/lib/filterRoutes.test.ts
import { buildFilterCombos } from "./filterRoutes";

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
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `pnpm exec vitest run src/lib/filterRoutes.test.ts`
Expected: FAIL (`buildFilterCombos` no existe).

- [ ] **Step 3: Implementar `buildFilterCombos`**

Genera, por cada propiedad, todos los subconjuntos canónicos no vacíos de sus dimensiones presentes (operación, tipo, ciudad) en orden, y deduplica.

```ts
// añadir a src/lib/filterRoutes.ts
import type { FilterCombo } from "@/types/filterRoutes";

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
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `pnpm exec vitest run src/lib/filterRoutes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterRoutes.ts src/lib/filterRoutes.test.ts
git commit -m "feat: generador de combinaciones canónicas de filtros

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Plantilla de SEO y matcher de override (TDD)

`filterSeo.ts`: `buildFilterSeoDefaults(filters, labels)` → `{ title, description, h1, canonicalUrl }`, y `findFilterSeoOverride(entries, filters)` → entrada que matchea exactamente.

**Files:**
- Create: `src/lib/filterSeo.ts`
- Test: `src/lib/filterSeo.test.ts`

- [ ] **Step 1: Escribir tests que fallan**

```ts
// src/lib/filterSeo.test.ts
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
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `pnpm exec vitest run src/lib/filterSeo.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `filterSeo.ts`**

```ts
// src/lib/filterSeo.ts
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
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `pnpm exec vitest run src/lib/filterSeo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterSeo.ts src/lib/filterSeo.test.ts
git commit -m "feat: plantilla de SEO y matcher de override para filtros

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Schema `filterPageSeo` en Sanity Studio

**Files:**
- Create: `apps/studio/schemaTypes/filterPageSeoType.ts`
- Modify: `apps/studio/schemaTypes/index.ts`

- [ ] **Step 1: Crear el schema**

```ts
// apps/studio/schemaTypes/filterPageSeoType.ts
import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons";

export const filterPageSeoType = defineType({
  name: "filterPageSeo",
  title: "SEO de sección",
  type: "document",
  icon: SearchIcon,
  description:
    "Override de SEO para una página de filtro (ej: /propiedades/venta). " +
    "Si no existe, se usa una plantilla automática.",
  fields: [
    defineField({
      name: "operation",
      title: "Operación",
      type: "string",
      options: {
        list: [
          { title: "Venta", value: "venta" },
          { title: "Alquiler", value: "alquiler" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "propertyType",
      title: "Tipo de propiedad",
      type: "reference",
      to: [{ type: "propertyTypeCategory" }],
    }),
    defineField({
      name: "city",
      title: "Ciudad",
      type: "reference",
      to: [{ type: "city" }],
    }),
    defineField({
      name: "intro",
      title: "Texto introductorio",
      description:
        "Texto único que se muestra en la página de la sección. Ayuda al SEO.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      operation: "operation",
      type: "propertyType.name",
      city: "city.name",
    },
    prepare({ operation, type, city }) {
      const parts = [operation, type, city].filter(Boolean);
      return {
        title: parts.length ? parts.join(" / ") : "(sin combinación)",
        subtitle: "SEO de sección",
      };
    },
  },
});
```

- [ ] **Step 2: Registrar en el index**

En `apps/studio/schemaTypes/index.ts`, importar y agregar al array:

```ts
import {filterPageSeoType} from './filterPageSeoType'
// ...
export const schemaTypes = [
  seoType,
  homePageType,
  propiedadesPageType,
  siteSettingsType,
  propertyType,
  cityType,
  propertyTypeCategoryType,
  filterPageSeoType,
]
```

- [ ] **Step 3: Verificar build del studio**

Run (desde repo root): `pnpm --filter dzts-studio exec sanity build`
Expected: build OK (sin errores de schema).

- [ ] **Step 4: Commit**

```bash
git add apps/studio/schemaTypes/filterPageSeoType.ts apps/studio/schemaTypes/index.ts
git commit -m "feat(studio): doc filterPageSeo para SEO editable de secciones

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> **Schema deploy (manual, fuera del código):** tras mergear, correr el flujo `typegen` → `deploy` → commitear `apps/frontend/src/sanity/types.ts` (ver CLAUDE.md / README "Schema changes"). Hasta tener `types.ts` regenerado, la Task 7 usa un tipo manual local para `FilterSeoEntry` (ya definido en Task 5), así que el frontend compila sin esperar el deploy.

---

## Task 7: Query de overrides `filterPageSeo`

**Files:**
- Create: `src/sanity/queries/filterPageSeo.ts`

- [ ] **Step 1: Implementar la query**

```ts
// src/sanity/queries/filterPageSeo.ts
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { FilterSeoEntry } from "@/lib/filterSeo";

const FILTER_PAGE_SEO_QUERY = defineQuery(`
  *[_type == "filterPageSeo"]{
    operation,
    "typeSlug": propertyType->slug.current,
    "citySlug": city->slug.current,
    intro,
    seo {
      metaTitle,
      metaDescription,
      ogImage { asset->{ url } },
      noIndex
    }
  }
`);

export async function getCachedFilterPageSeo(): Promise<FilterSeoEntry[]> {
  const { data } = await sanityFetch({ query: FILTER_PAGE_SEO_QUERY });
  return (data ?? []) as FilterSeoEntry[];
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/queries/filterPageSeo.ts
git commit -m "feat: query de overrides filterPageSeo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Extraer el detalle a `PropertyDetail.tsx`

Mover el cuerpo del actual `[slug]/page.tsx` a un componente reutilizable, para que la ruta catch-all lo invoque sin duplicar lógica. Sin cambios de comportamiento.

**Files:**
- Create: `src/components/PropertyDetail.tsx`
- Reference: `src/app/(site)/propiedades/[slug]/page.tsx` (origen)

- [ ] **Step 1: Crear `PropertyDetail.tsx`**

Copiar de `[slug]/page.tsx` todo **menos** `generateMetadata` y `generateStaticParams`. Exportar el componente por defecto recibiendo `slug` como prop (no `params`), y exportar también una función `buildPropertyMetadata(slug)` que encapsule la metadata del detalle. Estructura:

```tsx
// src/components/PropertyDetail.tsx
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import {
  getCachedOrganization,
  buildOrganizationJsonLd,
} from "@/sanity/queries/siteSettings";
import { getCachedProperty } from "@/sanity/queries/propertyDetail";
import { resolveMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import ShareButton from "@/components/ShareButton";
import ImageCarousel from "@/components/ImageCarousel";
import MapSection from "@/components/MapSection";
import "@/app/(site)/propiedades/property-detail.css";

// ... pegar STATUS_LABELS, tipos PropertyFeature/Property,
// PropertyHeader, PropertyFeaturesGrid, PropertyActions tal cual ...

export async function buildPropertyMetadata(slug: string): Promise<Metadata> {
  const [property, siteSeo] = await Promise.all([
    getCachedProperty(slug),
    getCachedSiteSeo(),
  ]);
  if (!property) return {};
  const ogImageUrl = property.ogImage
    ? urlFor(property.ogImage).width(1200).height(630).url()
    : undefined;
  return resolveMetadata(property.seo, siteSeo, {
    title: property.title,
    description: property.subtitle,
    ogImageUrl,
    canonicalUrl: `/propiedades/${slug}`,
  });
}

export default async function PropertyDetail({ slug }: { slug: string }) {
  // ... pegar el cuerpo del actual PropertyPage, usando `slug` directo ...
}
```

> Nota: mover el `.css` del detalle a `src/app/(site)/propiedades/property-detail.css` (un nivel arriba) para que tanto `PropertyDetail` como la ruta lo encuentren, o mantener el import por path absoluto `@/app/...`. Elegir una y ser consistente. El bloque actual está en `[slug]/property-detail.css`; al borrar `[slug]/` en Task 10 hay que reubicarlo. **Acción concreta:** `git mv "src/app/(site)/propiedades/[slug]/property-detail.css" "src/app/(site)/propiedades/property-detail.css"` y ajustar el import a `import "@/app/(site)/propiedades/property-detail.css";`.

- [ ] **Step 2: Mover el CSS del detalle**

```bash
git mv "src/app/(site)/propiedades/[slug]/property-detail.css" "src/app/(site)/propiedades/property-detail.css"
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores (el viejo `[slug]/page.tsx` aún importa su css; ajustar su import al nuevo path para que compile, se borrará en Task 10).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extraer detalle de propiedad a PropertyDetail

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Componente `FilteredListingIntro`

Renderiza el `<h1>`, breadcrumb y el JSON-LD `BreadcrumbList` para una página de filtro, más el intro Portable Text opcional.

**Files:**
- Create: `src/components/FilteredListingIntro.tsx`

- [ ] **Step 1: Implementar el componente**

```tsx
// src/components/FilteredListingIntro.tsx
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { ParsedFilters } from "@/types/filterRoutes";
import { buildFilterPath } from "@/lib/filterRoutes";
import Breadcrumb from "@/components/Breadcrumb";

interface FilteredListingIntroProps {
  filters: ParsedFilters;
  h1: string;
  typeName: string | null;
  cityName: string | null;
  intro?: PortableTextBlock[] | null;
}

const OPERATION_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

export default function FilteredListingIntro({
  filters,
  h1,
  typeName,
  cityName,
  intro,
}: FilteredListingIntroProps) {
  const crumbs = [
    { label: "Inicio", href: "/", isHome: true },
    { label: "Propiedades", href: "/propiedades" },
  ];

  // breadcrumb acumulando segmentos en orden canónico
  let acc: ParsedFilters = { operation: null, typeSlug: null, citySlug: null };
  if (filters.operation) {
    acc = { ...acc, operation: filters.operation };
    crumbs.push({ label: OPERATION_LABEL[filters.operation], href: buildFilterPath(acc) });
  }
  if (filters.typeSlug) {
    acc = { ...acc, typeSlug: filters.typeSlug };
    crumbs.push({ label: typeName || filters.typeSlug, href: buildFilterPath(acc) });
  }
  if (filters.citySlug) {
    acc = { ...acc, citySlug: filters.citySlug };
    crumbs.push({ label: cityName || filters.citySlug, href: buildFilterPath(acc) });
  }

  return (
    <>
      <Breadcrumb items={crumbs} />
      <h1 className="text-center mb-4 fw-bold">{h1}</h1>
      {intro && intro.length > 0 && (
        <div className="mb-4 text-muted">
          <PortableText value={intro} />
        </div>
      )}
    </>
  );
}
```

> El JSON-LD `BreadcrumbList` lo genera `Breadcrumb` internamente (ver CLAUDE.md: "pass href for all breadcrumb items"). No duplicar.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilteredListingIntro.tsx
git commit -m "feat: componente de intro para listados filtrados

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Refactor de `PropertiesListing` para filtros principales por props

`PropertiesListing` deja de leer operación/tipo/ciudad de query params: los recibe por props (desde la ruta). Mantiene los secundarios (dormitorios, superficie, disponibles, orden, página) en query params.

**Files:**
- Modify: `src/components/PropertiesListing.tsx`

- [ ] **Step 1: Cambiar la firma e interpretar filtros principales por props**

Reemplazar la interfaz de props y el inicio de `PropertiesListingInner`:

```tsx
interface PropertiesListingProps {
  properties: PropertyListItem[];
  filterOptions: FilterOptions;
  routeFilters: import("@/types/filterRoutes").ParsedFilters;
}
```

En `PropertiesListingInner`, eliminar la lectura de `operacion`, `propiedad` y `localidad` desde `searchParams` y derivarlos de `routeFilters`:

```tsx
const operationType = routeFilters.operation || "";
const propertyTypeSlugs = routeFilters.typeSlug ? [routeFilters.typeSlug] : [];
const citySlugs = routeFilters.citySlug ? [routeFilters.citySlug] : [];
```

Dejar igual la lectura de `dormitorios`, `disponibles`, `supmin`, `supmax`, `pagina`, `orden`. La lógica de `filtered`/`useMemo` no cambia (sigue usando esas variables).

- [ ] **Step 2: Propagar a través de `PropertiesLayout`**

`PropertiesLayout` debe recibir `routeFilters` y pasarlo a `PropertiesFilters` y `ActiveFilterBadges`. Agregar `routeFilters` a `PropertiesLayoutProps` y reenviarlo. (Ver Tasks 11-12 para el uso.)

Actualizar la llamada en `PropertiesListingInner`:

```tsx
return (
  <PropertiesLayout
    filterOptions={filterOptions}
    totalCount={totalCount}
    routeFilters={routeFilters}
  >
    {/* ... */}
  </PropertiesLayout>
);
```

Y `PropertiesListing` (el wrapper con `Suspense`) y `PropertiesListingFallback` deben aceptar/ignorar `routeFilters` según corresponda (el fallback no lo necesita).

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: errores esperados en `PropertiesLayout`, `PropertiesFilters`, `ActiveFilterBadges` (se resuelven en Tasks 11-12) y en las páginas que instancian `PropertiesListing` (se resuelven en Tasks 13-14). Confirmar que los errores son solo de `routeFilters` faltante, no otros.

- [ ] **Step 4: Commit (WIP de la cadena de props)**

```bash
git add src/components/PropertiesListing.tsx
git commit -m "refactor: PropertiesListing recibe filtros principales por props

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Refactor de `PropertiesFilters` para navegar por ruta

Operación/tipo/ciudad pasan a navegar a la URL canónica (combinando con los secundarios actuales como query params). Los secundarios siguen aplicándose como hoy.

**Files:**
- Modify: `src/components/PropertiesLayout.tsx`
- Modify: `src/components/PropertiesFilters.tsx`

- [ ] **Step 1: Pasar `routeFilters` desde el layout**

En `PropertiesLayout.tsx`, agregar `routeFilters` a props y pasarlo a `PropertiesFilters` y `ActiveFilterBadges`:

```tsx
interface PropertiesLayoutProps {
  filterOptions: FilterOptions;
  totalCount: number;
  routeFilters: import("@/types/filterRoutes").ParsedFilters;
  children: React.ReactNode;
}
// ...
<PropertiesFilters /* ...props existentes... */ routeFilters={routeFilters} />
// ...
<ActiveFilterBadges
  cities={filterOptions.cities}
  propertyTypes={filterOptions.propertyTypes}
  routeFilters={routeFilters}
  startTransition={startTransition}
/>
```

- [ ] **Step 2: Inicializar el estado del filtro desde `routeFilters` + query params**

En `PropertiesFilters.tsx`:
- Agregar `routeFilters: ParsedFilters` a `PropertiesFiltersProps` y propagarlo a `PropertiesFiltersInner`.
- El `useReducer` inicial: operación/propiedad/localidad vienen de `routeFilters`, el resto de query params:

```tsx
const [filters, dispatch] = useReducer(filterReducer, undefined, () => ({
  operacion: routeFilters.operation || "",
  propiedad: routeFilters.typeSlug ? [routeFilters.typeSlug] : [],
  localidad: routeFilters.citySlug ? [routeFilters.citySlug] : [],
  dormitorios: initialDormitorios,
  soloDisponibles: searchParams.get("disponibles") === "1",
  supMin: initialSupMin,
  supMax: initialSupMax,
}));
```

> Nota de alcance: hoy tipo/localidad son multi-select (checkboxes, varios slugs). Con segmentos de ruta, el filtro principal es **un** tipo y **una** ciudad. Para no romper la UX, mantener los checkboxes pero al aplicar se toma **el primero** de cada dimensión para la ruta; los adicionales se ignoran en la URL canónica (documentar). Alternativa más limpia (recomendada si hay tiempo): convertir tipo y localidad del panel a single-select (radios) como operación. **Decisión por defecto del plan: single-select** — cambiar `FilterCheckboxGroup` de propiedad y localidad por `FilterRadioGroup` con opción "Todas", coherente con operación.

- [ ] **Step 3: Reescribir `applyFilters` y `clearFilters` para construir la ruta**

```tsx
const applyFilters = () => {
  const path = buildFilterPath({
    operation: (filters.operacion as OperationSlug) || null,
    typeSlug: filters.propiedad[0] ?? null,
    citySlug: filters.localidad[0] ?? null,
  });

  const params = new URLSearchParams();
  if (filters.dormitorios.length > 0)
    params.set("dormitorios", filters.dormitorios.join(","));
  if (filters.soloDisponibles) params.set("disponibles", "1");
  if (filters.supMin) params.set("supmin", filters.supMin);
  if (filters.supMax) params.set("supmax", filters.supMax);
  const orden = searchParams.get("orden");
  if (orden) params.set("orden", orden);

  const qs = params.toString();
  startTransition(() => {
    router.push(qs ? `${path}?${qs}` : path);
  });
  setIsOpenMobile(false);
};

const clearFilters = () => {
  dispatch({ type: "RESET" });
  startTransition(() => {
    router.push("/propiedades");
  });
  setIsOpenMobile(false);
};
```

Importar al tope del archivo:

```tsx
import { buildFilterPath } from "@/lib/filterRoutes";
import type { ParsedFilters, OperationSlug } from "@/types/filterRoutes";
```

- [ ] **Step 4: Convertir tipo y localidad a single-select**

Reemplazar los `FilterCheckboxGroup` de "Tipo de propiedad" y "Localidad" por `FilterRadioGroup` con una opción inicial "Todas" (`value: ""`), y cambiar las acciones del reducer `TOGGLE_PROPIEDAD`/`TOGGLE_LOCALIDAD` por `SET_PROPIEDAD`/`SET_LOCALIDAD` que setean `[value]` o `[]`. Mantener los ids existentes (`propiedad-<slug>`, `localidad-<slug>`) para no romper selectores e2e que sí persisten; los e2e se actualizan en Task 17.

```tsx
// reducer
case "SET_PROPIEDAD":
  return { ...state, propiedad: action.value ? [action.value] : [] };
case "SET_LOCALIDAD":
  return { ...state, localidad: action.value ? [action.value] : [] };
```

```tsx
// en el form, sección Tipo de propiedad
<FilterRadioGroup
  name="propiedad"
  idPrefix="propiedad"
  value={filters.propiedad[0] || ""}
  options={[{ value: "", label: "Todas" }, ...propertyTypes.map((t) => ({ value: t.slug, label: t.name }))]}
  onChange={(value) => dispatch({ type: "SET_PROPIEDAD", value })}
/>
```

(Análogo para Localidad con `name="localidad"`, `idPrefix="localidad"`, `cities`.)

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: resueltos los errores de `PropertiesFilters`/`PropertiesLayout`; quedan pendientes solo `ActiveFilterBadges` (Task 12) y las páginas (Tasks 13-14).

- [ ] **Step 6: Commit**

```bash
git add src/components/PropertiesFilters.tsx src/components/PropertiesLayout.tsx
git commit -m "refactor: filtros principales navegan a la URL canónica

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Refactor de `ActiveFilterBadges` para quitar filtros principales por ruta

**Files:**
- Modify: `src/components/ActiveFilterBadges.tsx`

- [ ] **Step 1: Leer filtros principales de `routeFilters` y secundarios de query params**

- Agregar `routeFilters: ParsedFilters` a props.
- Operación/tipo/ciudad salen de `routeFilters`; dormitorios/disponibles/superficie siguen de `searchParams`.
- `removeFilter` para una dimensión principal: reconstruir la ruta sin esa dimensión (preservando query params secundarios). Para secundarios: como hoy (mutar query params sobre la **ruta actual**, no sobre `/propiedades` fijo).

```tsx
import { buildFilterPath } from "@/lib/filterRoutes";
import type { ParsedFilters } from "@/types/filterRoutes";
import { usePathname } from "next/navigation";
// ...
const pathname = usePathname();

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
  if (key === "disponibles") params.delete(key);
  else if (key === "superficie") {
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
```

Construir `appliedFilters` con operación/tipo/ciudad desde `routeFilters` (mapeando a labels con `propertyTypes`/`cities`) y los secundarios desde query params, asignando a cada badge su handler de remove correspondiente (principal vs secundario).

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: resuelto `ActiveFilterBadges`; quedan solo las páginas (Tasks 13-14).

- [ ] **Step 3: Commit**

```bash
git add src/components/ActiveFilterBadges.tsx
git commit -m "refactor: badges quitan filtros principales navegando por ruta

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Base `/propiedades` pasa `routeFilters` vacíos

**Files:**
- Modify: `src/app/(site)/propiedades/page.tsx`

- [ ] **Step 1: Pasar `routeFilters` vacíos al listado**

En el `return`, agregar la prop:

```tsx
<PropertiesListing
  properties={propertiesList}
  filterOptions={filterOptions}
  routeFilters={{ operation: null, typeSlug: null, citySlug: null }}
/>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: resuelto el error de esta página.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/propiedades/page.tsx"
git commit -m "feat: base propiedades pasa filtros de ruta vacíos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Ruta catch-all `[...segmentos]` (detalle | listado filtrado)

El corazón del feature. Decide entre detalle y listado, genera params estáticos y metadata.

**Files:**
- Create: `src/app/(site)/propiedades/[...segmentos]/page.tsx`
- Create: `src/app/(site)/propiedades/[...segmentos]/loading.tsx`
- Delete: `src/app/(site)/propiedades/[slug]/page.tsx`, `.../[slug]/loading.tsx`

- [ ] **Step 1: Helper de datos compartido para listados filtrados**

Crear `src/sanity/queries/filterListing.ts` que reúne lo que la ruta necesita (propiedades + filterOptions + overrides) reutilizando queries existentes:

```ts
// src/sanity/queries/filterListing.ts
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { getCachedCities, getCachedPropertyTypes, getCachedRoomCounts } from "./properties";
import { getCachedFilterPageSeo } from "./filterPageSeo";
import { buildFilterOptions } from "@/lib/filters";
import type { PropertyListItem } from "@/components/PropertiesListing";

export const ALL_PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && defined(slug.current) && published != false]
    | order(publishedAt desc) {
    _id, title, "slug": slug.current, subtitle, price, currency,
    operationType, status,
    "propertyType": propertyType->name,
    "propertyTypeSlug": propertyType->slug.current,
    "city": city->name,
    "citySlug": city->slug.current,
    rooms, sizeTotal, size, reference,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }
`);

export async function getFilterListingData() {
  const [{ data: rawProperties }, cities, propertyTypes, roomCounts, seoEntries] =
    await Promise.all([
      sanityFetch({ query: ALL_PROPERTIES_QUERY }),
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedFilterPageSeo(),
    ]);

  const properties: PropertyListItem[] = (rawProperties ?? []).map((p: any) => ({
    ...p,
    image: p.image?.asset?.url ? p.image.asset : null,
    lqip: p.image?.asset?.metadata?.lqip ?? null,
  }));

  return {
    properties,
    filterOptions: buildFilterOptions(cities, propertyTypes, roomCounts),
    seoEntries,
  };
}
```

> Mantener el mapeo `image`/`lqip` coherente con `propiedades/page.tsx` (ver `RawProperty` allí). Ajustar si el proyecto evita `any` — tipar `rawProperties` con la forma de la query.

- [ ] **Step 2: Implementar `loading.tsx`**

Reusar el skeleton del listado existente (copiar de `propiedades/loading.tsx`). Para el caso detalle, un skeleton genérico es aceptable (la mayoría de navegaciones a detalle vienen del listado con prefetch).

```tsx
// src/app/(site)/propiedades/[...segmentos]/loading.tsx
export { default } from "@/app/(site)/propiedades/loading";
```

- [ ] **Step 3: Implementar la ruta**

```tsx
// src/app/(site)/propiedades/[...segmentos]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";
import { getAllPropertySlugs } from "@/sanity/queries/propertyDetail";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import { resolveMetadata } from "@/lib/seo";
import { parseSegments, buildFilterCombos, type KnownSlugs } from "@/lib/filterRoutes";
import { buildFilterSeoDefaults, findFilterSeoOverride } from "@/lib/filterSeo";
import PropertyDetail, { buildPropertyMetadata } from "@/components/PropertyDetail";
import PropertiesListing from "@/components/PropertiesListing";
import FilteredListingIntro from "@/components/FilteredListingIntro";
import { getFilterListingData } from "@/sanity/queries/filterListing";

const FILTER_FACETS_QUERY = defineQuery(`{
  "types": *[_type == "propertyTypeCategory" && defined(slug.current)].slug.current,
  "cities": *[_type == "city" && defined(slug.current)].slug.current,
  "comboSource": *[_type == "property" && published != false]{
    operationType,
    "typeSlug": propertyType->slug.current,
    "citySlug": city->slug.current
  }
}`);

async function getKnownSlugs(): Promise<KnownSlugs> {
  const { data } = await sanityFetch({ query: FILTER_FACETS_QUERY });
  return {
    types: new Set((data?.types ?? []).filter(Boolean) as string[]),
    cities: new Set((data?.cities ?? []).filter(Boolean) as string[]),
  };
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({ query: FILTER_FACETS_QUERY });
  const slugEntries = await getAllPropertySlugs();
  const propertySlugs = slugEntries.map((e) => e.slug);

  // Guard de namespaces disjuntos: ningún slug de propiedad puede ser
  // operación/tipo/ciudad.
  const reserved = new Set<string>([
    "venta",
    "alquiler",
    ...((data?.types ?? []).filter(Boolean) as string[]),
    ...((data?.cities ?? []).filter(Boolean) as string[]),
  ]);
  for (const slug of propertySlugs) {
    if (reserved.has(slug)) {
      throw new Error(
        `[rutas-filtro] El slug de propiedad "${slug}" colisiona con un slug de operación/tipo/ciudad. Renombralo en Sanity.`,
      );
    }
  }

  const combos = buildFilterCombos(data?.comboSource ?? []);

  return [
    ...propertySlugs.map((slug) => ({ segmentos: [slug] })),
    ...combos.map((segmentos) => ({ segmentos })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segmentos: string[] }>;
}): Promise<Metadata> {
  const { segmentos } = await params;
  const known = await getKnownSlugs();
  const filters = parseSegments(segmentos, known);

  if (!filters) {
    // 1 segmento = posible detalle
    if (segmentos.length === 1) return buildPropertyMetadata(segmentos[0]);
    return {};
  }

  const { seoEntries, filterOptions } = await getFilterListingData();
  const siteSeo = await getCachedSiteSeo();
  const labels = {
    typeNameBySlug: Object.fromEntries(filterOptions.propertyTypes.map((t) => [t.slug, t.name])),
    cityNameBySlug: Object.fromEntries(filterOptions.cities.map((c) => [c.slug, c.name])),
  };
  const defaults = buildFilterSeoDefaults(filters, labels);
  const override = findFilterSeoOverride(seoEntries, filters);

  return resolveMetadata(override?.seo ?? null, siteSeo, {
    title: defaults.title,
    description: defaults.description,
    canonicalUrl: defaults.canonicalUrl,
  });
}

export default async function PropiedadesSegmentos({
  params,
}: {
  params: Promise<{ segmentos: string[] }>;
}) {
  const { segmentos } = await params;
  const known = await getKnownSlugs();
  const filters = parseSegments(segmentos, known);

  // No matchea filtros → puede ser detalle (1 segmento) o 404.
  if (!filters) {
    if (segmentos.length === 1) {
      return <PropertyDetail slug={segmentos[0]} />;
    }
    notFound();
  }

  const { properties, filterOptions, seoEntries } = await getFilterListingData();
  const labels = {
    typeNameBySlug: Object.fromEntries(filterOptions.propertyTypes.map((t) => [t.slug, t.name])),
    cityNameBySlug: Object.fromEntries(filterOptions.cities.map((c) => [c.slug, c.name])),
  };
  const defaults = buildFilterSeoDefaults(filters, labels);
  const override = findFilterSeoOverride(seoEntries, filters);

  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <FilteredListingIntro
        filters={filters}
        h1={override?.seo?.metaTitle || defaults.h1}
        typeName={filters.typeSlug ? labels.typeNameBySlug[filters.typeSlug] ?? null : null}
        cityName={filters.citySlug ? labels.cityNameBySlug[filters.citySlug] ?? null : null}
        intro={override?.intro ?? null}
      />
      <PropertiesListing
        properties={properties}
        filterOptions={filterOptions}
        routeFilters={filters}
      />
    </main>
  );
}
```

> Importante: cuando `filters` es válido pero `segmentos.length === 1` y ese único segmento es **también** un slug de propiedad, el guard de namespaces disjuntos garantiza que no haya ambigüedad (no puede ser ambos). El orden de chequeo (filtros primero) es seguro por eso.

- [ ] **Step 4: Borrar la ruta de detalle vieja**

```bash
git rm "src/app/(site)/propiedades/[slug]/page.tsx" "src/app/(site)/propiedades/[slug]/loading.tsx"
```

Si el directorio `[slug]/` queda vacío en `(site)`, git lo deja de trackear automáticamente. La ficha sigue en `(print)/propiedades/[slug]/ficha/` (no se toca).

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 6: Build de export y verificación de páginas**

Run: `pnpm build`
Expected: build OK. Verificar en `out/`:

```bash
ls out/propiedades/venta/index.html \
   out/propiedades/alquiler/index.html
ls "out/propiedades" | head   # debe incluir slugs de propiedad y operaciones
```

Expected: existen `propiedades/venta/`, `propiedades/alquiler/`, las combinaciones con datos, y los detalles `propiedades/<slug>/` con su `ficha/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: ruta catch-all de propiedades (detalle + listados filtrados)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: Redirección de links viejos con query params principales

Links antiguos `/propiedades?operacion=venta&propiedad=casa&localidad=rosario&...` deben redirigir client-side a la URL canónica, preservando los secundarios.

**Files:**
- Modify: `src/app/(site)/propiedades/page.tsx`
- Create: `src/components/LegacyFilterRedirect.tsx`

- [ ] **Step 1: Componente cliente de redirección**

```tsx
// src/components/LegacyFilterRedirect.tsx
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
```

- [ ] **Step 2: Montar en la base, envuelto en Suspense**

En `propiedades/page.tsx`, importar y renderizar dentro de un `<Suspense>` (requerido por `useSearchParams`):

```tsx
import { Suspense } from "react";
import LegacyFilterRedirect from "@/components/LegacyFilterRedirect";
// ... dentro del <main>, al inicio:
<Suspense fallback={null}>
  <LegacyFilterRedirect />
</Suspense>
```

- [ ] **Step 3: Build + verificación manual**

Run: `pnpm build && pnpm start`
Luego, en el navegador: abrir `/propiedades/?operacion=venta` → debe redirigir a `/propiedades/venta/`.
Expected: la URL cambia a la canónica.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: redirección de filtros legacy en query params a la URL canónica

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 16: Sitemap con combinaciones de filtro

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Agregar los combos al sitemap**

Extender la query de propiedades para traer también las dimensiones, generar combos con `buildFilterCombos` y agregar sus URLs:

```ts
import { buildFilterCombos } from "@/lib/filterRoutes";

interface PropertyRow {
  slug: string;
  _updatedAt: string;
  operationType: string | null;
  typeSlug: string | null;
  citySlug: string | null;
}

// dentro de sitemap():
const properties = await client.fetch<PropertyRow[]>(`
  *[_type == "property" && defined(slug.current) && published != false] {
    "slug": slug.current,
    _updatedAt,
    operationType,
    "typeSlug": propertyType->slug.current,
    "citySlug": city->slug.current
  }
`);

const comboUrls: MetadataRoute.Sitemap = buildFilterCombos(properties).map((segments) => ({
  url: `${baseUrl}/propiedades/${segments.join("/")}`,
  changeFrequency: "weekly",
  priority: 0.7,
}));

// en el return, agregar ...comboUrls junto a los demás.
```

(El mapeo de `propertyUrls` sigue usando `property.slug` / `property._updatedAt` igual que hoy.)

- [ ] **Step 2: Build y verificación**

Run: `pnpm build`
Then: `grep -c "propiedades/venta" out/sitemap.xml`
Expected: ≥1 (las combos aparecen en el sitemap).

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: sitemap incluye combinaciones de filtro

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 17: Enlaces internos en `/propiedades`

Bloque de enlaces internos hacia las secciones principales, para que Google las descubra y las considere para sitelinks.

**Files:**
- Create: `src/components/SectionLinks.tsx`
- Modify: `src/app/(site)/propiedades/page.tsx`

- [ ] **Step 1: Componente con enlaces a las secciones presentes**

```tsx
// src/components/SectionLinks.tsx
import Link from "next/link";
import type { FilterOption } from "@/types/filters";

interface SectionLinksProps {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
}

export default function SectionLinks({ cities, propertyTypes }: SectionLinksProps) {
  return (
    <nav aria-label="Secciones" className="mb-4">
      <div className="d-flex flex-wrap gap-2">
        <Link href="/propiedades/venta" className="btn btn-outline-primary btn-sm">
          En venta
        </Link>
        <Link href="/propiedades/alquiler" className="btn btn-outline-primary btn-sm">
          En alquiler
        </Link>
        {propertyTypes.slice(0, 6).map((t) => (
          <Link
            key={t.slug}
            href={`/propiedades/venta/${t.slug}`}
            className="btn btn-outline-secondary btn-sm"
          >
            {t.name} en venta
          </Link>
        ))}
        {cities.slice(0, 6).map((c) => (
          <Link
            key={c.slug}
            href={`/propiedades/venta/${c.slug}`}
            className="btn btn-outline-secondary btn-sm"
          >
            Venta en {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

> Los enlaces apuntan a combos que pueden no existir si no hay propiedades de esa combinación (404 en estático). Mitigación simple: en la base, estos enlaces de tipo/ciudad usan rutas de **una sola dimensión** (`/propiedades/<tipo>` y `/propiedades/<ciudad>`) que existen si hay ≥1 propiedad de ese tipo/ciudad (cualquier operación). Cambiar los `href` a `/propiedades/${t.slug}` y `/propiedades/${c.slug}`. "En venta"/"En alquiler" sí existen mientras haya ≥1 propiedad de esa operación.

- [ ] **Step 2: Montar en la base**

En `propiedades/page.tsx`, debajo del `<h1>`:

```tsx
<SectionLinks
  cities={filterOptions.cities}
  propertyTypes={filterOptions.propertyTypes}
/>
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: OK; los `href` de `SectionLinks` corresponden a rutas generadas.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: enlaces internos a secciones en la página de propiedades

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 18: Tests e2e

**Files:**
- Modify: `e2e/propiedades.spec.ts`
- Create: `e2e/secciones.spec.ts`

- [ ] **Step 1: Crear smoke tests de las nuevas rutas**

```ts
// e2e/secciones.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Secciones (rutas de filtro)", () => {
  test("la página de venta carga con h1 y breadcrumb", async ({ page }) => {
    await page.goto("/propiedades/venta/");
    await expect(page.locator("h1")).toContainText(/venta/i);
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test("la página de alquiler es indexable y canónica", async ({ page }) => {
    await page.goto("/propiedades/alquiler/");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/propiedades\/alquiler\/?$/);
  });

  test("combinación inexistente devuelve 404", async ({ page }) => {
    const res = await page.goto("/propiedades/venta/combinacion-que-no-existe-xyz/");
    expect(res?.status()).toBe(404);
  });

  test("desde la base se puede navegar a una sección", async ({ page }) => {
    await page.goto("/propiedades/");
    await page.locator('a[href="/propiedades/venta"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/venta\/?/);
  });
});
```

- [ ] **Step 2: Ajustar los selectores afectados en `propiedades.spec.ts`**

Donde el test seleccione operación vía `label[for='operacion-venta']` y espere un query param, actualizar para esperar **navegación de ruta** a `/propiedades/venta`. Donde quite un badge de filtro principal, esperar el cambio de ruta. (Mantener los asserts estructurales; ver CLAUDE.md "Test Design Principles".)

- [ ] **Step 3: Build + correr e2e**

Run: `pnpm build && pnpm test:e2e`
Expected: PASS (todos los specs).

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test(e2e): smoke tests de rutas de filtro y ajustes de selectores

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 19: Actualizar CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Documentar rutas y schema**

- En "Frontend Routes": agregar `/propiedades/[...segmentos]` (detalle + listados filtrados por operación/tipo/ciudad), explicando el orden canónico y que el detalle conserva `/propiedades/<slug>`.
- En "Content Integration"/"Components": mencionar `filterPageSeo` ("SEO de sección") y la resolución plantilla→override.
- En la tabla de selectores e2e: actualizar las filas que cambiaron (operación/tipo/localidad ahora son radios y navegan por ruta; agregar `secciones.spec.ts`).
- Nota sobre el guard de namespaces disjuntos (slugs de propiedad vs operación/tipo/ciudad).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: documenta rutas de filtro y filterPageSeo en CLAUDE.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 20: Verificación final + PR

**Files:** —

- [ ] **Step 1: Suite completa**

Run (desde `apps/frontend/`):
```bash
pnpm lint && pnpm test && pnpm exec tsc --noEmit && pnpm build && pnpm test:e2e
```
Run (desde repo root):
```bash
pnpm --filter dzts-studio exec sanity build
```
Expected: todo verde.

- [ ] **Step 2: Revisión manual de humo**

`pnpm start` y verificar a mano:
- `/propiedades/` → enlaces de sección visibles.
- `/propiedades/venta/` → h1 "Propiedades/Casas en venta…", filtros secundarios funcionan sin cambiar el segmento de operación.
- Aplicar tipo/ciudad desde el panel → la URL acumula segmentos en orden canónico.
- Quitar un badge principal → la URL pierde ese segmento.
- Un detalle `/propiedades/<slug>/` → carga normal; su `ficha` abre.

- [ ] **Step 3: Crear el PR contra `dev`**

```bash
git push -u origin feat/rutas-filtro-seo
gh pr create --repo pablocolaiacovo/dzts-website --base dev \
  --title "feat: rutas de filtro indexables para SEO (sitelinks)" \
  --body "Implementa rutas /propiedades/{operación}/{tipo}/{ciudad} indexables con SEO propio (plantilla + override editable filterPageSeo en Sanity), para habilitar sitelinks en Google. Detalle de propiedad unificado en la ruta catch-all. Ver docs/superpowers/specs/2026-06-05-rutas-filtro-seo-design.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

> **Recordatorio post-merge (manual):** correr el flujo de schema `typegen` → `deploy` → commitear `apps/frontend/src/sanity/types.ts` para que `filterPageSeo` quede en los tipos generados (CLAUDE.md / README "Schema changes"). Cargar en Sanity los overrides de `venta` y `alquiler` (los principales candidatos a sitelink).

---

## Self-review (cobertura del spec)

- Objetivo / por qué query params no alcanzan → Tasks 14, 16 (rutas reales + sitemap).
- URLs anidadas, orden canónico, parsing por valor → Tasks 2-3, 14.
- `generateStaticParams` solo combos con datos → Task 4 + 14.
- Guard de namespaces disjuntos → Task 14 (Step 3).
- SEO por página (title/desc/canonical/OG/h1/breadcrumb/JSON-LD) → Tasks 5, 9, 14.
- SEO editable `filterPageSeo` + resolución plantilla→override → Tasks 6, 7, 14.
- `intro` Portable Text renderizado → Task 9 + 14.
- Refactor filtros (principales por ruta, secundarios query params) → Tasks 10-13.
- Enlaces internos + sitemap → Tasks 16, 17.
- Compatibilidad (redirect legacy) → Task 15.
- Tests + docs → Tasks 18, 19.
- Riesgo overlap ficha → Task 1 (de-risk) + 14 (Step 6).
- Flujo manual de schema → Tasks 6, 20 (recordatorios).
