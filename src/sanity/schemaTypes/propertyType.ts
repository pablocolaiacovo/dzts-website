import { defineField, defineType } from "sanity";

export const propertyType = defineType({
    name: 'property',
    title: 'Properties',
    type: 'document',
    fields: [
        defineField({
            name: "slug",
            type: "slug",
            options: { source: 'title' },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'title',
            type: 'string',
            validation: (rule) => rule.required()
        }),
        defineField({
            name: "subtitle",
            type: "string"
        }),
        defineField({
            name: 'publishedAt',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'images',
            type: 'array',
            of: [{ type: 'image' }],
        }),
        defineField({
            name: "address",
            type: "string",
            validation: (rule) => rule.required()
        }),
        defineField({
            name: "price",
            type: "number",
        })
    ]
})