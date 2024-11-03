import assert from "node:assert"
import type { Client } from "@libsql/client"

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "~/.server/db/schema"

assert(process.env.DATABASE_URL, "env: DATABASE_URL missing!")
assert(process.env.DATABASE_TOKEN, "env: DATABASE_TOKEN missing!")

const globalForDb = globalThis as unknown as {
  client: Client | undefined
}

export const client =
  globalForDb.client ??
  createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_TOKEN,
  })

if (process.env.NODE_ENV !== "production") globalForDb.client = client

export const db = drizzle(client, { schema })
