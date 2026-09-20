# Header y logo del hero — exploración de diseño

- **Fecha**: 2026-09-09
- **Estado**: Fase 1 (propuestas). Pendiente elegir opción para pasar a implementación.
- **Agente**: `ui-developer` (brief del arquitecto: header con logo más grande + logo del hero de la home más grande, tratados como un solo problema de diseño en `/`).

## Artifacts publicados (para juntar feedback)

| Opción | Link |
|---|---|
| 1 · Barra Alta (recomendada) | https://claude.ai/code/artifact/bd1c0cfe-78af-4a73-9a72-3cf783087012 |
| 2 · Masthead | https://claude.ai/code/artifact/dc205635-8ef8-4cb8-92d9-ad71d4b1fd5a |
| 3 · Marca Compacta | https://claude.ai/code/artifact/9f31c736-b92b-47ef-8382-99f6ec3fdf56 |
| Análisis del asset del logo | https://claude.ai/code/artifact/d764c032-6e54-45b3-a8e9-a9014f378ae0 |

Los artifacts son copias de los HTML de esta carpeta con Bootstrap inline y los logos embebidos como data URI (los artifacts no permiten CSS ni imágenes externas). Los archivos de acá son la fuente; se abren directo en el navegador.

## Archivos

- `option-1-barra-alta.html`, `option-2-masthead.html`, `option-3-marca-compacta.html` — prototipos autocontenidos (header + hero de la home + contenido de relleno para ver el scroll). Bootstrap 5.3 e Inter desde CDN, tokens copiados de `apps/frontend/src/styles/variables.css`.
- `asset-comparison.html` — análisis del PNG del logo: padding transparente, escalera de legibilidad, qué exports pedir.
- `logo-source.png` — el PNG original del cliente (3543×1993, con márgenes transparentes).
- `logo-full.png` — lockup completo recortado al arte (1900×811).
- `logo-compact.png` — lockup sin la bajada "by César Torres" (1900×605).
- `logo-mark.png` — solo la marca "dzts", stand-in del asset del hero (`homePage.heroLogo`, que es otro archivo en Sanity).

## Hallazgo principal: el asset, no el CSS

El arte ocupa el 21,8% del área del PNG (bbox del alpha: x 898–2797, y 645–1455). Con `max-height: 60px` en el header actual se ven ~24px de logo. Recortar el archivo antes de subirlo a Sanity da +146% de tinta en la misma caja y baja el peso de 39KB a 10KB.

Bandas del lockup (fracción del alto del arte): «dzts™» 0–39,9%, «inmobiliaria» 45,6–74,6%, «by César Torres» 84,2–100%. El lockup sin bajada es exactamente el 74,6% superior. La bajada deja de ser legible por debajo de ~70px de alto de arte.

**Pedir al cliente**, en orden de prioridad:

1. Lockup completo, recortado al arte, SVG con textos convertidos a curvas.
2. Lockup sin bajada, mismo tratamiento.
3. Variante en tinta oscura para fondos claros (ficha / impresión).
4. Si no hay vector: los dos recortes en PNG-24 con alpha, ~1900×811 y ~1900×605.
5. Para el hero: la misma marca «dzts» en degradé, recortada, SVG o PNG ~1600px de ancho.

Sanity no transforma SVG (`urlFor().width()` devuelve el archivo tal cual, sin `lqip` ni `srcset`). Para un logo de dos colores es el trade correcto.

**Plan B si no pueden re-exportar**: la herramienta de recorte del Studio (`hotspot: true` ya está en el campo) hoy no hace nada porque `SITE_SETTINGS_QUERY` no proyecta `crop` ni `hotspot`. Agregar esos dos campos la activa. **No compensar por CSS** (`transform: scale`, márgenes negativos): hardcodea los porcentajes de padding de este archivo y se rompe en silencio al reemplazarlo.

## Las tres opciones

Alto del arte visible (hoy: ~24px en todas las pantallas). Medido en Chrome a 375×667 y 1200×800.

| | Mobile reposo | Mobile scroll | Desktop reposo | Desktop scroll | Alto de barra desktop |
|---|---|---|---|---|---|
| 1 · Barra Alta | 56px | 39px | 82px | 48px | 110px → 68px |
| 2 · Masthead | 64px | 46px | 92px | 48px | ~158px → 102px |
| 3 · Marca Compacta | 40px | 40px | 52px | 52px | 79px fijo (hoy 84px) |

**1 · Barra Alta.** Una fila, logo a la izquierda, nav a la derecha (la estructura actual, más alta). En reposo muestra el lockup completo con bajada legible; al scrollear la barra se comprime y el logo hace crossfade al recorte compacto, que a esa altura ya sería ilegible. Ambos recortes viven dentro del mismo `.navbar-brand`, renderizados al mismo ancho, así el wordmark no se mueve durante el fade. En la home el header es `position: fixed` y transparente con un scrim superior sobre el hero, y se solidifica a `--header-nav-bg` al scrollear. Hero: `min(70vw, 280px)` / `min(52vw, 780px)`. Contras: barra más alta en reposo; necesita el segundo asset (recorte compacto); comportamiento exclusivo de la home vía `usePathname()`.

**2 · Masthead.** Centrado y simétrico, dos filas en `lg`+ (logo arriba, divisor, nav centrada abajo); una fila con logo centrado y toggler absoluto a la derecha en mobile. Solo el lockup completo, un asset, sin crossfade. En la home el hero *es* el masthead: en reposo la barra es transparente con la fila de marca colapsada, y al scrollear aparece directamente en su tamaño comprimido. Hero: `min(80vw, 320px)` / `min(56vw, 860px)`, el más grande. Contras: estado scrolleado más pesado (102px); la bajada a 7,6px es textura, no texto; en `/` en reposo no hay logo clickeable en el header; un header que *crece* al scrollear es poco convencional.

**3 · Marca Compacta.** Usa solo el recorte sin bajada, alto fijo, sin shrink: la barra ya está en su mínimo útil y en cambio gana elevación (sombra que se profundiza al scrollear). Regla inferior de 3px en `--bs-primary` que hace eco de la barra de 4px de `PropertyCard`, y subrayado cyan en la página actual. Mismo header en todas las páginas, sin `usePathname()`. El hero resta el alto real de la barra (`calc(100svh - 63px)`). Hero: `min(74vw, 300px)` / `min(50vw, 760px)`. Contras: pierde la bajada en todos lados; menor presencia del header; una barra más baja que la actual es difícil de vender a quien pidió "más grande", aunque la tinta se duplique.

**Cuarta dirección no construida**: header como la opción 3 y todo el crecimiento en el hero, sumando una franja de marca chica en `/propiedades` y detalle. Vale si el reclamo real es sobre la home y no sobre el header.

## Recomendación

**Opción 1, Barra Alta.** Da lo que el cliente pidió (lockup completo, visiblemente grande, con bajada legible en desktop: 82px de arte, 3,4× la tinta actual) y el crossfade al recorte compacto resuelve el único problema del lockup completo, que la bajada se convierte en mancha por debajo de ~70px. La 2 da un logo apenas mayor en reposo a costa de 102px de chrome permanente y una home sin marca en el header. La 3 es la respuesta más segura de ingeniería y el fallback si el cliente solo puede entregar un asset.

Header y hero deben ser piezas distintas: el header lleva el lockup (identifica el sitio en todas las páginas), el hero solo «dzts» grande (gesto gráfico; el `h1` de abajo ya dice qué es el negocio). Repetir el lockup completo a 80px y a 250px con 100px de separación es lo que haría ver la home recargada.

## Presupuesto vertical en 375px

Las tres opciones dejan el formulario de búsqueda completo arriba del fold en 375×667, después de ajustar el contenedor del hero a `py-4 py-md-5`, el `h1` a `mb-3 mb-md-4` y la fila de filtros a `g-2 g-md-3`. Borde inferior de "Buscar": opción 1 = 568px, 2 = 561px, 3 = 563px de 667. Sin overflow horizontal; el toggler tiene espacio en las tres.

## Lo que hace falta de otros (independiente de la opción)

- **Query de Sanity**: agregar `crop` y `hotspot` a la proyección de `logo` en `SITE_SETTINGS_QUERY` (`apps/frontend/src/sanity/queries/siteSettings.ts`). Sin eso la herramienta de recorte del Studio es inerte.
- **Bug del hero**: `apps/frontend/src/app/(site)/page.tsx` pide el logo del hero con `urlFor(heroLogo).width(400)`, pero las tres opciones lo renderizan a 600–780px CSS. A 2× DPR se ve borroso. Subir a ~1600 o usar `sizes` con el loader de Sanity.
- **Campo nuevo si se elige la opción 1**: `logoCompact` en `siteSettings`, o derivar el recorte compacto del lockup completo con `.rect()` y la constante 74,6%. Es cambio de schema.
- **Assets del cliente**: los exports listados arriba.
- **Selectores e2e**: ninguno cambia. `navigation.spec.ts` clickea `.navbar-brand` solo en `/propiedades`, así que la marca oculta de la opción 2 en la home no rompe tests, pero es una decisión de usabilidad a confirmar.

## Hallazgos de implementación (para la fase 2)

- `animation-timeline: scroll()` no funciona dentro de un elemento `position: fixed` (no tiene scroll container ancestro; la animación no hace nada en silencio). Las opciones 1 y 2 hacen el header fixed en `/`, así que deben usar `animation-timeline: scroll(root)`. El `Header.css` actual zafa con `scroll()` solo porque el header es `sticky`.
- Un grid con `height` fijo igual dimensiona su fila implícita al contenido, así que `height: 100%` en un item resuelve contra la fila, no contra el contenedor. Hace falta `grid-template-rows: minmax(0, 1fr)`.

## Verificación

Chrome, scroll real, 375×667 y 1200×800 (vía iframes). Todos los números de reposo y scroll fueron medidos. Modo oscuro verificado; **modo claro no verificado visualmente** (el CSS está). `prefers-reduced-motion` y los fallbacks `@supports not (animation-timeline: …)` están escritos pero **no se ejercitaron en el navegador**.
