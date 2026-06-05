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
