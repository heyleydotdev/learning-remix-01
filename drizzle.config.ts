import assert from "node:assert"

import { type Config } from "drizzle-kit"

assert(process.env.DATABASE_PREFIX, "env: DATABASE_PREFIX missing!")
assert(process.env.DATABASE_URL, "env: DATABASE_URL missing!")
assert(process.env.DATABASE_TOKEN, "env: DATABASE_TOKEN missing!")

export default {
  schema: "./app/.server/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_TOKEN,
  },
  tablesFilter: [`${process.env.DATABASE_PREFIX}*`],
} satisfies Config
