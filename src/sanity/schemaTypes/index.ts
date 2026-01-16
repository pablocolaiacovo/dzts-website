import { type SchemaTypeDefinition } from 'sanity'
import { propertyType } from './propertyType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [propertyType],
}
