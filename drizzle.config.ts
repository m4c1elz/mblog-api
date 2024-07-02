import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "mysql",
    out: "./drizzle",
    schema: "./src/db/schema/index.ts",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    introspect: {
        casing: "camel",
    },
})
