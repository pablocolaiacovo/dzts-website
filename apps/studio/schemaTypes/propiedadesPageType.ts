import { defineField, defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons";

export const propiedadesPageType = defineType({
  name: "propiedadesPage",
  title: "Página de Propiedades",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Página de Propiedades" };
    },
  },
});
