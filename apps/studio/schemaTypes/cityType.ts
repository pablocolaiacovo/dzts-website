import { defineField, defineType } from "sanity";

export const cityType = defineType({
    name: "city",
    title: "Ciudades",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nombre",
            type: "string",
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "name" },
            validation: (rule) => rule.required(),
        }),
    ],
});
