import { defineField, defineType } from "sanity";

export const propertyType = defineType({
    name: 'property',
    title: 'Propiedades',
    type: 'document',
    fields: [
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: 'title' },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Título',
            type: 'string',
            validation: (rule) => rule.required()
        }),
        defineField({
            name: "subtitle",
            title: "Subtítulo",
            type: "string"
        }),
        defineField({
            name: 'publishedAt',
            title: 'Fecha de publicación',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Descripción',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'images',
            title: 'Imágenes',
            type: 'array',
            of: [{ type: 'image' }],
        }),
        defineField({
            name: "operationType",
            title: "Tipo de operación",
            type: "string",
            options: {
                list: [
                    { title: "Venta", value: "venta" },
                    { title: "Alquiler", value: "alquiler" },
                ],
            },
        }),
        defineField({
            name: "propertyType",
            title: "Tipo de propiedad",
            type: "string",
            options: {
                list: [
                    { title: "Casa", value: "casa" },
                    { title: "Departamento", value: "departamento" },
                    { title: "Terreno", value: "terreno" },
                ],
            },
        }),
        defineField({
            name: "address",
            title: "Dirección",
            type: "string",
            validation: (rule) => rule.required()
        }),
        defineField({
            name: "city",
            title: "Ciudad",
            type: "string",
            options: {
                list: [
                    { title: "Buenos Aires", value: "buenos-aires" },
                    { title: "Córdoba", value: "cordoba" },
                    { title: "Rosario", value: "rosario" },
                    { title: "Mendoza", value: "mendoza" },
                ],
            },
        }),
        defineField({
            name: "price",
            title: "Precio",
            type: "number",
        }),
        defineField({
            name: "currency",
            title: "Moneda",
            type: "string",
            options: {
                list: [
                    { title: "USD ($)", value: "USD" },
                    { title: "ARS ($)", value: "ARS" },
                ],
            },
            initialValue: "USD",
        }),
    ]
})