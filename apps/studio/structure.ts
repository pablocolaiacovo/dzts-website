import type { StructureResolver } from "sanity/structure";
import { CogIcon, DocumentsIcon, HomeIcon, MarkerIcon, TagsIcon } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Página de Inicio")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Página de Inicio")
        ),

      S.listItem()
        .title("Página de Propiedades")
        .icon(DocumentsIcon)
        .child(
          S.document()
            .schemaType("propiedadesPage")
            .documentId("propiedadesPage")
            .title("Página de Propiedades")
        ),

      S.listItem()
        .title("Configuración del Sitio")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Configuración del Sitio")
        ),

      S.divider(),

      orderableDocumentListDeskItem({
        type: "property",
        title: "Propiedades",
        icon: HomeIcon,
        S,
        context,
      }),

      orderableDocumentListDeskItem({
        type: "city",
        title: "Ciudades",
        icon: MarkerIcon,
        S,
        context,
      }),

      orderableDocumentListDeskItem({
        type: "propertyTypeCategory",
        title: "Tipos de Propiedad",
        icon: TagsIcon,
        S,
        context,
      }),
    ]);
