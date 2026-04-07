import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes/index";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
const plugins = [structureTool({ structure }), visionTool()];
const schema = { types: schemaTypes };

export default defineConfig([
  {
    name: "production",
    title: "DZTS Studio (Production)",
    projectId,
    dataset: "production",
    basePath: "/production",
    plugins,
    schema,
  },
  {
    name: "development",
    title: "DZTS Studio (Sandbox)",
    projectId,
    dataset: "development",
    basePath: "/development",
    plugins,
    schema,
  },
]);
