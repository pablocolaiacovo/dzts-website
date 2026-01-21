import { type SchemaTypeDefinition } from "sanity";
import { cityType } from "./cityType";
import { propertyType } from "./propertyType";
import { propertyTypeCategoryType } from "./propertyTypeCategoryType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cityType, propertyType, propertyTypeCategoryType],
};
