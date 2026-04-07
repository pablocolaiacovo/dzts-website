import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset || 'production',
  },
  deployment: {
    appId: 'sc293jr0om051i0svxbktau1',
    autoUpdates: true,
  },
  typegen: {
    path: "../frontend/src/**/*.{ts,tsx,js,jsx}",
    schema: "./schema.json",
    generates: "../frontend/src/sanity/types.ts",
  },
})
