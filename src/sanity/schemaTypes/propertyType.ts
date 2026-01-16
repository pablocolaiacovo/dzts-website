import { defineField, defineType } from "sanity";

export const propertyType = defineType({
    name: 'property',
    title: 'Properties',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string'
        })
    ]
})