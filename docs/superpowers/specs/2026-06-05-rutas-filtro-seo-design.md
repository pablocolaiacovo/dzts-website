# Diseño: Rutas de filtro indexables para SEO (sitelinks)

**Fecha:** 2026-06-05
**Estado:** Aprobado (diseño) — pendiente plan de implementación
**Rama:** `feat/rutas-filtro-seo`

## Objetivo

Que Google pueda mostrar **sitelinks** (subpáginas) bajo el resultado del sitio
—por ejemplo "Venta", "Alquiler", "Casas en venta en Rosario"— tal como hacen
otras inmobiliarias.

Los sitelinks **no se configuran directamente**: Google los elige
automáticamente entre las páginas **indexables** que encuentra. Por lo tanto el
objetivo real de este trabajo es **convertir los filtros principales en URLs
reales, indexables, con SEO propio**, en lugar de query params que no generan
páginas distinguibles.

## Por qué los query params no alcanzan

El frontend es **export estático** (`output: "export"`, sin servidor). En ese
modelo:

| | `/propiedades?operacion=venta` | `/propiedades/venta` |
|---|---|---|
| Archivo en `out/` | el mismo `propiedades/index.html` | propio `propiedades/venta/index.html` |
| `<title>` / `description` / canonical | idénticos a `/propiedades` | propios y únicos |
| Qué ve Google | una sola página | una página distinta, indexable |

El query param se resuelve client-side **después** de cargar el HTML; para Google
es el mismo documento. Una ruta real produce un HTML separado con su propio
`<head>`, por lo que es indexable por separado y candidata a sitelink.

## Decisiones de producto (acordadas)

1. **Esquema de URLs:** anidado bajo `/propiedades`.
2. **Filtros que son segmentos de ruta:** operación, tipo de propiedad y ciudad.
3. **Orden canónico:** `operación / tipo / ciudad`.
   - `/propiedades/venta`
   - `/propiedades/venta/casa`
   - `/propiedades/venta/casa/rosario`
   - `/propiedades/alquiler/departamento/funes`
4. **Filtros secundarios** (dormitorios, superficie, precio, orden, paginación):
   siguen como **query params** (no generan páginas nuevas).
5. **Enfoque A — completo:** operación + tipo + ciudad desde el inicio, todo de
   una vez (no por fases).

## Arquitectura

### El nudo: colisión detalle vs. filtros

Hoy el detalle es `/propiedades/[slug]`. Las rutas de filtro
(`/propiedades/venta`, `/propiedades/venta/casa/rosario`) colisionan con `[slug]`:
`/propiedades/venta` matchea tanto `[slug]` (slug="venta") como la ruta de filtro.
Next.js **no permite** `[slug]` y un catch-all en el mismo nivel.

**Resolución:** una única ruta catch-all
`(site)/propiedades/[...segmentos]/page.tsx` que sirve **ambos** casos y decide
en runtime qué renderizar. La base `/propiedades` permanece en su propio
`page.tsx` (todas las propiedades, sin filtro principal).

```
src/app/(site)/propiedades/
  page.tsx                  # base: todas las propiedades (sin filtro principal)
  [...segmentos]/
    page.tsx                # detalle  O  listado filtrado (decide por contenido)
    loading.tsx             # skeleton (genérico o ramificado)
```

> El detalle de propiedad **mantiene su URL actual** `/propiedades/<slug>` — no
> hay regresión de SEO en las propiedades ya indexadas. Solo cambia el archivo de
> ruta donde vive la lógica.

### Desambiguación por valor, no por posición

Cada segmento se identifica matcheando su slug contra conjuntos conocidos
(disjuntos):

- **Operación:** `{ venta, alquiler }` (fijo en código).
- **Tipo:** slugs de `propertyType` desde Sanity.
- **Ciudad:** slugs de `city` desde Sanity.
- **Propiedad:** slugs de `property` desde Sanity.

Lógica del componente de ruta para `segmentos`:

1. Si es **1 segmento** y coincide con un **slug de propiedad** → render **detalle**.
2. Si no, parsear cada segmento como operación/tipo/ciudad → render **listado
   filtrado** con esos filtros principales pre-aplicados.
3. Si un segmento no matchea ningún conjunto, o el orden no es canónico, o la
   combinación no existe → `notFound()`.

Como es export estático, solo se sirven rutas pre-generadas; la desambiguación en
runtime solo decide qué componente renderizar para una ruta ya válida.

### Guard de namespaces disjuntos (build-time)

Para que la desambiguación sea inequívoca, **ningún slug de propiedad** puede
igualar un slug de operación/tipo/ciudad (y operación/tipo/ciudad entre sí
tampoco deben colisionar). En la práctica no ocurre (slugs de propiedad son
descriptivos), pero se agrega una **validación en `generateStaticParams()` que
hace fallar el build con un mensaje claro** si hay colisión, en vez de degradar
silenciosamente.

### Generación estática

`generateStaticParams()` en `[...segmentos]` emite:

- **Detalle:** un entry por cada slug de propiedad publicada (lo que hoy hace el
  `generateStaticParams` del detalle).
- **Filtros:** **todas las subcombinaciones canónicas con ≥1 propiedad**.
  Se computan a partir del set de propiedades publicadas. Para cada propiedad se
  derivan sus segmentos canónicos (operación, tipo, ciudad) y se emiten todos los
  prefijos/subconjuntos en orden canónico que existan en los datos, p. ej.:
  `[venta]`, `[venta, casa]`, `[venta, casa, rosario]`, y también
  `[casa]` (solo tipo) o `[rosario]` (solo ciudad) cuando aparecen.
  Regla única: **se emite la combinación si y solo si existe al menos una
  propiedad que la satisface**. Esto evita páginas vacías y acota el conteo en
  `out/`.

La base `/propiedades` (sin segmentos) la sigue generando su `page.tsx`.

## SEO por página

Cada ruta de filtro genera su `<head>` propio en build vía `generateMetadata()`
(que recibe `params.segmentos`):

- **`<title>` y `meta description`:** únicos por combinación, vía una **plantilla**
  derivada de los nombres de operación/tipo/ciudad
  (ej. "Casas en venta en Rosario | DZTS Inmobiliaria").
  - **Override editable en Sanity** (ver sección siguiente) para las páginas que se
    quieran cuidar a mano. El resto usa la plantilla automática.
- **`canonical`:** a la URL limpia (sin query params secundarios) → evita
  duplicados por dormitorios/orden/página.
- **OpenGraph:** propio por página.
- **JSON-LD:** `BreadcrumbList` por página; opcionalmente `CollectionPage` /
  `ItemList` con las propiedades de la sección.
- **`<h1>`:** propio, derivado de los segmentos.
- **Breadcrumb visible:** `Inicio › Propiedades › Venta › Casa › Rosario`.

El patrón replica el ya existente en el detalle y en `propiedades/page.tsx`
(`resolveMetadata()` + `getCached*Seo()`), sin dependencias nuevas.

## SEO editable por sección (Sanity)

El SEO de cada página de filtro se resuelve en **dos niveles**, reaprovechando la
cadena de fallback de `resolveMetadata()`:

```
override en Sanity (si existe)  →  plantilla automática (código)  →  SEO del sitio
```

- **Plantilla automática:** cubre todas las combinaciones sin intervención. Genera
  title/description desde los nombres de operación/tipo/ciudad. Es el
  `contentDefaults` que ya consume `resolveMetadata()`.
- **Override editable:** un **nuevo tipo de documento en Sanity**, p. ej.
  `filterPageSeo` ("SEO de sección"), pensado para curar a mano las páginas
  importantes (típicamente `venta` y `alquiler`).

### Esquema del documento `filterPageSeo`

| Campo | Tipo | Notas |
|---|---|---|
| `operation` | string (select: `venta` / `alquiler`) | opcional |
| `propertyType` | reference → `propertyType` | opcional |
| `city` | reference → `city` | opcional |
| `seo` | objeto `seo` existente | metaTitle, metaDescription, ogImage, noIndex |
| `intro` | Portable Text | opcional; texto único que se renderiza en la página |

- **Respuesta a la pregunta "¿dónde defino el SEO de `/propiedades/venta`?":**
  se crea una entrada de `filterPageSeo` con `operation = venta` (tipo y ciudad
  vacíos) y se completa el bloque `seo`. Para `/propiedades/venta/casa/rosario`,
  una entrada con `operation = venta`, `propertyType = casa`, `city = rosario`.
- **Matching:** en build se traen todas las entradas de `filterPageSeo` (son pocas,
  cacheado una vez) y se busca la que coincide exactamente con los segmentos
  activos (operación + slug de tipo + slug de ciudad, con nulos). Si hay match,
  su `seo` pisa la plantilla; si no, se usa la plantilla.
- **`intro`:** cuando la entrada tiene texto introductorio, se renderiza en la
  página de listado (encima o debajo del grid). Contenido único por landing →
  ayuda al SEO y a la candidatura a sitelink.
- **Unicidad:** se define un `preview`/título derivado de la combinación para que el
  editor vea claramente cada entrada; se documenta que debe haber **una sola
  entrada por combinación**.

### Flujo de cambio de esquema (manual)

Agregar `filterPageSeo` toca el schema de Studio, así que aplica el flujo de tres
pasos del repo: `typegen` → `deploy` → commitear `apps/frontend/src/sanity/types.ts`
(ver CLAUDE.md / README "Schema changes"). El build FTP del frontend corre contra
los tipos commiteados.

## Refactor de los filtros (UX)

Modelo actual: `PropertiesListing` (client) lee **todos** los filtros de
`useSearchParams` y filtra/pagina en memoria sobre todas las propiedades.

Modelo nuevo:

- **Filtros principales (operación/tipo/ciudad):** vienen de la **ruta** (props
  desde el server component), no de query params.
- **Filtros secundarios (dormitorios, superficie, precio, orden, página):** siguen
  en query params, instantáneos client-side.
- Los **controles de operación/tipo/ciudad pasan a navegar** (`Link` /
  `router.push`) a la URL canónica correspondiente; los secundarios siguen sin
  navegación. Beneficio colateral: esos controles se vuelven **enlaces internos
  crawleables**.
- En export estático cada navegación va a una página ya pre-generada → rápida con
  prefetch de `next/link`.

Componentes afectados: `PropertiesListing`, `PropertiesFilters`,
`ActiveFilterBadges` (los badges de filtros principales ahora se quitan navegando
a la URL sin ese segmento).

## Enlaces internos + sitemap

Clave para que Google descubra las páginas y las considere para sitelinks:

- **Navegación (Sanity `mainNavigation`):** entradas internas a `/propiedades/venta`
  y `/propiedades/alquiler`.
- **Bloque de enlaces internos** en `/propiedades` hacia las combinaciones
  principales (operaciones, y top tipos/ciudades).
- **`sitemap.ts`:** agregar todas las combinaciones de filtro generadas (las
  mismas que emite `generateStaticParams`), además de home, `/propiedades` y los
  detalles que ya incluye.

## Compatibilidad y limpieza

- **Redirección client-side** de links viejos con filtros principales en query
  params (`/propiedades?operacion=venta&...`) hacia la URL canónica equivalente
  (`/propiedades/venta`), preservando los query params secundarios.
- **`.htaccess`:** revisar si hace falta alguna regla adicional (el trailing-slash
  ya está); la redirección de query params se hace client-side porque el host es
  estático.

## Impacto en tests

- **E2E:** los specs y selectores que dependen del filtrado por query params
  (`#filters-form`, `label[for='operacion-venta']`, `.badge .btn-close`,
  `#operacion/#propiedad/#localidad`) se actualizan en el mismo trabajo para
  reflejar la navegación por ruta. Se agregan smoke tests de las nuevas rutas
  (`/propiedades/venta`, combinación con tipo/ciudad, y `notFound` de combinación
  inexistente).
- **Unit:** tests del parser de segmentos (valor→filtro, validación de orden
  canónico, combinación inexistente) y del builder de URLs canónicas.
- **CLAUDE.md:** actualizar la tabla de selectores y las notas de rutas.

## Riesgos / a verificar en implementación

1. **Overlap con la ficha** `(print)/propiedades/[slug]/ficha`: confirmar que
   Next.js resuelve `/propiedades/<slug>/ficha` a la ruta de ficha (más específica)
   y no al catch-all. En export estático no se genera ese path desde el catch-all,
   pero hay que validar que el build no marque rutas paralelas en conflicto.
2. **`loading.tsx` compartido** entre detalle y listado: definir un skeleton
   genérico o ramificar según el tipo de página.
3. **Conteo de páginas en `out/`:** verificar que la cantidad de combinaciones
   (solo las que tienen propiedades) se mantenga razonable a medida que crece el
   catálogo.
4. **Colisión de slugs:** el guard de build cubre el caso, pero documentar el
   mensaje de error y cómo resolverlo (renombrar slug).

## Fuera de alcance (YAGNI)

- Páginas por dormitorios/superficie/precio como segmentos de ruta.
- Una página `/contacto` dedicada (se puede sumar después como candidata extra a
  sitelink).
- Internacionalización / hreflang.
